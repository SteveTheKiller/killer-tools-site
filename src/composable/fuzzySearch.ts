import type { IFuseOptions } from 'fuse.js';
import type { MaybeRef } from 'vue';
import { get } from '@vueuse/core';
import Fuse from 'fuse.js';
import { computed } from 'vue';

export { useFuzzySearch };

function useFuzzySearch<Data>({
  search,
  data,
  options = {},
}: {
  search: MaybeRef<string>
  data: MaybeRef<Data[]>
  options?: IFuseOptions<Data> & { filterEmpty?: boolean }
}) {
  // Rebuilt when reactive data changes (e.g. translated reference data)
  const fuse = computed(() => new Fuse(get(data), options));
  const filterEmpty = options.filterEmpty ?? true;

  const searchResult = computed<Data[]>(() => {
    const query = get(search);

    if (!filterEmpty && query === '') {
      return get(data);
    }

    return fuse.value.search(query).map(({ item }) => item);
  });

  return { searchResult };
}
