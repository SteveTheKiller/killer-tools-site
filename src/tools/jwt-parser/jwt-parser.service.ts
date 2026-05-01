import { type JwtPayload, jwtDecode } from 'jwt-decode';
import _ from 'lodash';
import { ALGORITHM_DESCRIPTIONS, CLAIM_DESCRIPTIONS } from './jwt-parser.constants';

// jwt-decode v4 removed header decoding — decode manually via base64
interface JwtHeader {
  alg?: string
  typ?: string
  kid?: string
  [key: string]: unknown
}

function decodeJwtHeader(jwt: string): JwtHeader {
  const base64 = jwt.split('.')[0].replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64)) as JwtHeader;
}

export { decodeJwt };

function decodeJwt({ jwt }: { jwt: string }) {
  const rawHeader = decodeJwtHeader(jwt);
  const rawPayload = jwtDecode<JwtPayload>(jwt);

  const header = _.map(rawHeader, (value, claim) => parseClaims({ claim, value }));
  const payload = _.map(rawPayload, (value, claim) => parseClaims({ claim, value }));

  return {
    header,
    payload,
  };
}

function parseClaims({ claim, value }: { claim: string; value: unknown }) {
  const claimDescription = CLAIM_DESCRIPTIONS[claim];
  const formattedValue = _.isPlainObject(value) || _.isArray(value) ? JSON.stringify(value, null, 3) : _.toString(value);
  const friendlyValue = getFriendlyValue({ claim, value });

  return {
    value: formattedValue,
    friendlyValue,
    claim,
    claimDescription,
  };
}

function getFriendlyValue({ claim, value }: { claim: string; value: unknown }) {
  if (['exp', 'nbf', 'iat'].includes(claim)) {
    return dateFormatter(value);
  }

  if (claim === 'alg' && _.isString(value)) {
    return ALGORITHM_DESCRIPTIONS[value];
  }

  return undefined;
}

function dateFormatter(value: unknown) {
  if (_.isNil(value)) {
    return undefined;
  }

  const date = new Date(Number(value) * 1000);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}
