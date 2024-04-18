import * as R from 'ramda';
import type { UnwrapRef } from 'vue';

import type { SortOptions } from '~/interfaces/table';

const toLower = (a: string | null) => (a && typeof a === 'string' ? a.toLowerCase() : a);

export const useSortRows = <T>(rows: UnwrapRef<T>[], sortBy: SortOptions) => {
    const column = sortBy.column;

    if (sortBy.direction === 'asc') {
        return R.sortWith([R.ascend(R.compose(toLower, R.prop(column)))], rows);
    }

    return R.sortWith([R.descend(R.compose(toLower, R.prop(column)))], rows);
};
