import { redirect } from 'redux-first-router';
import {
  fetchDataAction,
  fetchSuccessAction,
  bulkFetchDataAction,
  createFetchPredicate,
} from 'controllers/fetch';
import { put, select, all, takeEvery, take, call } from 'redux-saga/effects';
import {
  testItemIdsArraySelector,
  launchIdSelector,
  pagePropertiesSelector,
  payloadSelector,
  TEST_ITEM_PAGE,
  pathnameChangedSelector,
} from 'controllers/pages';
import { URLS } from 'common/urls';
import { activeProjectSelector } from 'controllers/user';
import { LEVEL_NOT_FOUND } from 'common/constants/launchLevels';
import { setLevelAction, setPageLoadingAction } from './actionCreators';
import { FETCH_TEST_ITEMS, NAMESPACE, PARENT_ITEMS_NAMESPACE, RESTORE_PATH } from './constants';
import { LEVELS } from './levels';
import {
  namespaceSelector,
  parentItemSelector,
  queryParametersSelector,
  isLostLaunchSelector,
  createParentItemsSelector,
} from './selectors';
import { calculateLevel } from './utils';

function* updateLaunchId(launchId) {
  const payload = yield select(payloadSelector);
  const query = yield select(pagePropertiesSelector);
  const testItemIdsArray = yield select(testItemIdsArraySelector);
  yield put(
    redirect({
      type: TEST_ITEM_PAGE,
      payload: {
        ...payload,
        testItemIds: [launchId, ...testItemIdsArray.slice(1)].join('/'),
      },
      meta: { query },
    }),
  );
}

function* restorePath() {
  const parentItem = yield select(parentItemSelector);
  if (!parentItem) {
    return;
  }
  yield call(updateLaunchId, parentItem.launchId);
}

export function* fetchParentItems() {
  const itemIds = yield select(testItemIdsArraySelector);
  const project = yield select(activeProjectSelector);
  const urls = itemIds.map(
    (id, i) => (i === 0 ? URLS.launch(project, id) : URLS.testItem(project, id)),
  );
  yield put(bulkFetchDataAction(PARENT_ITEMS_NAMESPACE, true)(urls));
  yield take(createFetchPredicate(PARENT_ITEMS_NAMESPACE));
}

function* fetchTestItems({ payload = {} }) {
  const offset = payload.offset || 0;
  const isPathNameChanged = yield select(pathnameChangedSelector);
  if (isPathNameChanged && !payload.offset) {
    yield put(setPageLoadingAction(true));
    yield call(fetchParentItems);
  }
  const itemIdsArray = yield select(testItemIdsArraySelector);
  const itemIds = offset ? itemIdsArray.slice(0, itemIdsArray.length - offset) : itemIdsArray;
  let launchId = yield select(launchIdSelector);
  const isLostLaunch = yield select(isLostLaunchSelector);
  let parentId;
  if (isLostLaunch) {
    let parentItem;
    try {
      parentItem = yield select(createParentItemsSelector(offset));
    } catch (e) {} // eslint-disable-line no-empty
    launchId = parentItem ? parentItem.launchId : launchId;
  }
  if (itemIds.length > 1) {
    parentId = itemIds[itemIds.length - 1];
  }
  const project = yield select(activeProjectSelector);
  const namespace = yield select(namespaceSelector, offset);
  const query = yield select(queryParametersSelector, namespace);
  const pageQuery = yield select(pagePropertiesSelector);
  const uniqueIdFilterKey = 'filter.eq.uniqueId';

  const noChildFilter = 'filter.eq.hasChildren' in query;

  yield put(
    fetchDataAction(NAMESPACE)(URLS.testItems(project), {
      params: {
        'filter.eq.launchId': launchId,
        'filter.eq.parentId': !noChildFilter ? parentId : undefined,
        'filter.level.path': !parentId && !noChildFilter ? 1 : undefined,
        'filter.under.path': noChildFilter
          ? itemIds.filter((item) => item !== launchId).join('.')
          : undefined,
        [uniqueIdFilterKey]: pageQuery[uniqueIdFilterKey],
        ...query,
      },
    }),
  );
  const dataPayload = yield take(createFetchPredicate(NAMESPACE));
  let level;
  if (dataPayload.error) {
    level = LEVEL_NOT_FOUND;
  } else {
    level = calculateLevel(dataPayload.payload.content) || LEVEL_NOT_FOUND;
  }

  if (LEVELS[level]) {
    yield put(fetchSuccessAction(LEVELS[level].namespace, dataPayload.payload));
  }
  yield put(setLevelAction(level));
  yield put(setPageLoadingAction(false));
}

function* watchRestorePath() {
  yield takeEvery(RESTORE_PATH, restorePath);
}

function* watchFetchTestItems() {
  yield takeEvery(FETCH_TEST_ITEMS, fetchTestItems);
}

export function* testItemsSagas() {
  yield all([watchFetchTestItems(), watchRestorePath()]);
}
