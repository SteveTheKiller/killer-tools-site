"""Validate and package the directory plugin without uploading or publishing."""
import argparse
import hashlib
import json
import struct
from pathlib import Path
import urllib.request
import zipfile
import zlib

import jsonschema
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / 'openai-plugin'
SCHEMA_ROOT = 'https://agent-plugins.org/schemas/1.0.0/'


def retrieve_schema(uri):
    if not uri.startswith(SCHEMA_ROOT):
        raise ValueError('Unexpected schema reference: ' + uri)
    with urllib.request.urlopen(uri, timeout=20) as response:
        return Resource.from_contents(json.load(response))


def build(destination):
    destination = destination.resolve()
    if destination.exists():
        raise ValueError('Choose a new ZIP path. Existing output is never overwritten.')
    manifests = {}
    for name in ('plugin.json', 'mcp.json'):
        text = (PACKAGE / name).read_text(encoding='utf-8')
        if any(character in text for character in ('\u2013', '\u2014')):
            raise ValueError('Prohibited punctuation: ' + name)
        manifest = json.loads(text)
        schema = retrieve_schema(manifest['$schema']).contents
        jsonschema.Draft202012Validator(schema, registry=Registry(retrieve=retrieve_schema)).validate(manifest)
        manifests[name] = manifest
    plugin = manifests['plugin.json']['extensions']['com.openai']
    listing = plugin['interface']
    for field, limit in {'displayName': 30, 'shortDescription': 30, 'longDescription': 4000, 'developerName': 80}.items():
        if not isinstance(listing[field], str) or not listing[field].strip() or len(listing[field]) > limit:
            raise ValueError('Invalid listing field: ' + field)
    for field in ('websiteURL', 'supportURL', 'privacyPolicyURL', 'termsOfServiceURL'):
        if not listing[field].startswith('https://'):
            raise ValueError('HTTPS listing URL required: ' + field)
    cases = plugin['review']['test_cases']
    if len(cases['positive']) != 5 or len(cases['negative']) != 3:
        raise ValueError('Exactly five positive and three negative cases required.')
    for case in cases['positive'] + cases['negative']:
        for field in ('description', 'prompt', 'expected_behavior'):
            if not case[field].strip():
                raise ValueError('Missing review case field: ' + field)
    for case in cases['positive']:
        if not case['tools_triggered'].strip():
            raise ValueError('Positive review case must name a tool.')
    prompts = listing['defaultPrompt']
    if len(prompts) > 3 or len(set(prompts)) != len(prompts) or any(len(prompt) > 128 or '@' in prompt for prompt in prompts):
        raise ValueError('Invalid starter prompts.')
    servers = manifests['mcp.json']['mcpServers']
    if len(servers) != 1 or servers['killermcp'] != {'type': 'streamable-http', 'url': 'https://mcp.killertools.net/openai'}:
        raise ValueError('Unexpected MCP connection.')
    icon = ROOT.parent / 'public/brand/mcp.png'
    icon_bytes = icon.read_bytes()
    if icon_bytes[:8] != b'\x89PNG\r\n\x1a\n':
        raise ValueError('Expected a PNG icon.')
    width, height, depth, color, compression, filtering, interlace = struct.unpack('>IIBBBBB', icon_bytes[16:29])
    if width != height or not 48 <= width <= 4096 or (depth, color, compression, filtering, interlace) != (8, 6, 0, 0, 0):
        raise ValueError('Expected a square, noninterlaced 8-bit RGBA icon.')
    offset, image_data = 8, bytearray()
    while offset < len(icon_bytes):
        length = struct.unpack('>I', icon_bytes[offset:offset + 4])[0]
        kind = icon_bytes[offset + 4:offset + 8]
        chunk = icon_bytes[offset + 8:offset + 8 + length]
        crc = struct.unpack('>I', icon_bytes[offset + 8 + length:offset + 12 + length])[0]
        if zlib.crc32(kind + chunk) != crc:
            raise ValueError('PNG chunk checksum mismatch.')
        if kind == b'IDAT':
            image_data.extend(chunk)
        offset += 12 + length
    decoded = zlib.decompress(image_data)
    stride = 1 + width * 4
    if len(decoded) != stride * height or any(decoded[row * stride] > 4 for row in range(height)):
        raise ValueError('Invalid decoded PNG rows.')
    if len(icon_bytes) > 5 * 1024 * 1024:
        raise ValueError('Icon exceeds 5 MiB.')
    if any(listing[field] != './assets/mcp.png' for field in ('logo', 'composerIcon')):
        raise ValueError('Unexpected icon path.')
    destination.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(destination, 'x', zipfile.ZIP_DEFLATED) as archive:
        for name in manifests:
            archive.write(PACKAGE / name, name)
        archive.writestr('assets/mcp.png', icon_bytes)
    with zipfile.ZipFile(destination) as archive:
        if archive.testzip() is not None or set(archive.namelist()) != {'plugin.json', 'mcp.json', 'assets/mcp.png'}:
            raise ValueError('ZIP validation failed.')
        if hashlib.sha256(archive.read('assets/mcp.png')).digest() != hashlib.sha256(icon_bytes).digest():
            raise ValueError('Icon bytes changed during packaging.')
    print('Portable schemas, listing limits, review cases, icon and ZIP contents passed.')
    print('Created ' + str(destination))
    print('Publication still requires deployment, identity/domain verification, client review tests and a demo recording URL.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('destination', type=Path)
    build(parser.parse_args().destination)
