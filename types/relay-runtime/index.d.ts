import * as RelayRuntime from './definitions';
export class Environment implements RelayRuntime.Environment {
	public constructor(config: RelayRuntime.EnvironmentConfig);

	getStore(): RelayRuntime.Store;

	applyUpdate(updater: RelayRuntime.StoreUpdater): RelayRuntime.Disposable;

	check(readSelector: RelayRuntime.Selector): boolean;

	commitPayload(
		operationSelector: RelayRuntime.OperationSelector,
		payload: RelayRuntime.PayloadData,
	): void;

	commitUpdate(updater: RelayRuntime.StoreUpdater): void;

	lookup(readSelector: RelayRuntime.Selector): RelayRuntime.Snapshot;

	subscribe(
		snapshot: RelayRuntime.Snapshot,
		callback: (snapshot: RelayRuntime.Snapshot) => void,
	): RelayRuntime.Disposable;

	retain(selector: RelayRuntime.Selector): RelayRuntime.Disposable;

	sendQuery(queryConfig: {
		cacheConfig?: RelayRuntime.CacheConfig | null;
		onCompleted?: (() => void) | null,
		onError?: ((error: Error) => void) | null;
		onNext?: ((payload: RelayRuntime.RelayResponsePayload) => void) | null,
		operation: RelayRuntime.OperationSelector,
	}): RelayRuntime.Disposable;

	streamQuery(queryConfig: {
		cacheConfig?: RelayRuntime.CacheConfig | null;
		onCompleted?: (() => void) | null;
		onError?: ((error: Error) => void) | null;
		onNext?: ((payload: RelayRuntime.RelayResponsePayload) => void) | null;
		operation: RelayRuntime.OperationSelector;
	}): RelayRuntime.Disposable;

	sendMutation(mutationConfig: {
		onCompleted?: ((errors: Array<RelayRuntime.PayloadError> | null) => void) | null;
		onError?: ((error: Error) => void) | null;
		operation: RelayRuntime.OperationSelector;
		optimisticUpdater?: RelayRuntime.SelectorStoreUpdater | null;
		optimisticResponse?: Object;
		updater?: RelayRuntime.SelectorStoreUpdater | null;
		uploadables?: RelayRuntime.UploadableMap;
	}): RelayRuntime.Disposable;

	sendSubscription(subscriptionConfig: {
		onCompleted?: ((errors: Array<RelayRuntime.PayloadError> | null) => void) | null;
		onNext?: ((payload: RelayRuntime.RelayResponsePayload) => void) | null;
		onError?: ((error: Error) => void) | null,
		operation: RelayRuntime.OperationSelector,
		updater?: RelayRuntime.SelectorStoreUpdater | null,
	}): RelayRuntime.Disposable;
}

export const Network: {
	/**
	 * Creates an implementation of the `Network` interface defined in
	 * `RelayNetworkTypes` given a single `fetch` function.
	 */
	create(fetch: RelayRuntime.FetchFunction, subscribe?: RelayRuntime.SubscribeFunction): RelayRuntime.Network;
};

export const ConnectionHandler: {
	/**
	 * Creates an edge for a connection record, given a node and edge type.
	 */
	createEdge(store: RelayRuntime.RecordSourceProxy, record: RelayRuntime.RecordProxy, node: RelayRuntime.RecordProxy, edgeType: string): RelayRuntime.RecordProxy;
	/**
	 * Given a record and the name of the schema field for which a connection was
	 * fetched, returns the linked connection record.
	 *
	 * Example:
	 *
	 * Given that data has already been fetched on some user `<id>` on the `friends`
	 * field:
	 *
	 * ```
	 * fragment FriendsFragment on User {
	 *   friends(first: 10) @connection(key: "FriendsFragment_friends") {
	 *    edges {
	 *      node {
	 *        id
	 *        }
	 *      }
	 *   }
	 * }
	 * ```
	 *
	 * The `friends` connection record can be accessed with:
	 *
	 * ```
	 * store => {
	 *   const user = store.get('<id>');
	 *   const friends = RelayConnectionHandler.getConnection(user, 'FriendsFragment_friends');
	 *   // Access fields on the connection:
	 *   const edges = friends.getLinkedRecords('edges');
	 * }
	 * ```
	 *
	 * TODO: t15733312
	 * Currently we haven't run into this case yet, but we need to add a `getConnections`
	 * that returns an array of the connections under the same `key` regardless of the variables.
	 */
	getConnection(record: RelayRuntime.RecordProxy, key: string, filters?: RelayRuntime.Variables | null): RelayRuntime.RecordProxy | null;
	/**
	 * A default runtime handler for connection fields that appends newly fetched
	 * edges onto the end of a connection, regardless of the arguments used to fetch
	 * those edges.
	 */
	update(store: RelayRuntime.RecordSourceProxy, payload: RelayRuntime.HandleFieldPayload): void;

	/**
	 * Inserts an edge after the given cursor, or at the end of the list if no
	 * cursor is provided.
	 *
	 * Example:
	 *
	 * Given that data has already been fetched on some user `<id>` on the `friends`
	 * field:
	 *
	 * ```
	 * fragment FriendsFragment on User {
	 *   friends(first: 10) @connection(key: "FriendsFragment_friends") {
	 *    edges {
	 *      node {
	 *        id
	 *        }
	 *      }
	 *   }
	 * }
	 * ```
	 *
	 * An edge can be appended with:
	 *
	 * ```
	 * store => {
	 *   const user = store.get('<id>');
	 *   const friends = RelayConnectionHandler.getConnection(user, 'FriendsFragment_friends');
	 *   const edge = store.create('<edge-id>', 'FriendsEdge');
	 *   RelayConnectionHandler.insertEdgeAfter(friends, edge);
	 * }
	 * ```
	 */
	insertEdgeAfter(record: RelayRuntime.RecordProxy, newEdge: RelayRuntime.RecordProxy, cursor?: string | null): void;

	/**
	 * Inserts an edge before the given cursor, or at the beginning of the list if
	 * no cursor is provided.
	 *
	 * Example:
	 *
	 * Given that data has already been fetched on some user `<id>` on the `friends`
	 * field:
	 *
	 * ```
	 * fragment FriendsFragment on User {
	 *   friends(first: 10) @connection(key: "FriendsFragment_friends") {
	 *    edges {
	 *      node {
	 *        id
	 *        }
	 *      }
	 *   }
	 * }
	 * ```
	 *
	 * An edge can be prepended with:
	 *
	 * ```
	 * store => {
	 *   const user = store.get('<id>');
	 *   const friends = RelayConnectionHandler.getConnection(user, 'FriendsFragment_friends');
	 *   const edge = store.create('<edge-id>', 'FriendsEdge');
	 *   RelayConnectionHandler.insertEdgeBefore(friends, edge);
	 * }
	 * ```
	 */
	insertEdgeBefore(
		record: RelayRuntime.RecordProxy,
		newEdge: RelayRuntime.RecordProxy,
		cursor?: string | null,
	): void;
	/**
	 * Remove any edges whose `node.id` matches the given id.
	 */
	deleteNode(record: RelayRuntime.RecordProxy, nodeID: RelayRuntime.DataID): void;
};

/**
 * Determine if two selectors are equal (represent the same selection). Note
 * that this function returns `false` when the two queries/fragments are
 * different objects, even if they select the same fields.
 */
export function areEqualSelectors(thisSelector: RelayRuntime.Selector, thatSelector: RelayRuntime.Selector): boolean;

export function createFragmentSpecResolver(
	context: RelayRuntime.RelayContext,
	containerName: string,
	fragments: RelayRuntime.FragmentMap,
	props: RelayRuntime.Props,
	callback: () => void,
): RelayRuntime.FragmentSpecResolver;

/**
 * Creates an instance of the `OperationSelector` type defined in
 * `RelayStoreTypes` given an operation and some variables. The input variables
 * are filtered to exclude variables that do not match defined arguments on the
 * operation, and default values are populated for null values.
 */
export function createOperationSelector(
	operation: RelayRuntime.ConcreteBatch,
	variables: RelayRuntime.Variables,
): RelayRuntime.OperationSelector;

/**
 * Given a mapping of keys -> results and a mapping of keys -> fragments,
 * extracts a mapping of keys -> id(s) of the results.
 *
 * Similar to `getSelectorsFromObject()`, this function can be useful in
 * determining the "identity" of the props passed to a component.
 */
export function getDataIDsFromObject(
	fragments: { [key: string]: RelayRuntime.ConcreteFragment },
	object: { [key: string]: any },
): { [key: string]: (RelayRuntime.DataID | Array<RelayRuntime.DataID>) | null };

/**
 * Given a mapping of keys -> results and a mapping of keys -> fragments,
 * extracts the selectors for those fragments from the results.
 *
 * The canonical use-case for this function is ReactRelayFragmentContainer, which
 * uses this function to convert (props, fragments) into selectors so that it
 * can read the results to pass to the inner component.
 */
export function getSelectorsFromObject(
	operationVariables: RelayRuntime.Variables,
	fragments: { [key: string]: RelayRuntime.ConcreteFragment },
	object: { [key: string]: any },
): { [key: string]: (RelayRuntime.Selector | Array<RelayRuntime.Selector>) | null };

/**
 * Given the result `items` from a parent that fetched `fragment`, creates a
 * selector that can be used to read the results of that fragment on those
 * items. This is similar to `getSelector` but for "plural" fragments that
 * expect an array of results and therefore return an array of selectors.
 */
export function getSelectorList(
	operationVariables: RelayRuntime.Variables,
	fragment: RelayRuntime.ConcreteFragment,
	items: Array<any>,
): Array<RelayRuntime.Selector> | null;

/**
 * Given the result `item` from a parent that fetched `fragment`, creates a
 * selector that can be used to read the results of that fragment for that item.
 *
 * Example:
 *
 * Given two fragments as follows:
 *
 * ```
 * fragment Parent on User {
 *   id
 *   ...Child
 * }
 * fragment Child on User {
 *   name
 * }
 * ```
 *
 * And given some object `parent` that is the results of `Parent` for id "4",
 * the results of `Child` can be accessed by first getting a selector and then
 * using that selector to `lookup()` the results against the environment:
 *
 * ```
 * const childSelector = getSelector(queryVariables, Child, parent);
 * const childData = environment.lookup(childSelector).data;
 * ```
 */
export function getSelector(
	operationVariables: RelayRuntime.Variables,
	fragment: RelayRuntime.ConcreteFragment,
	item: any,
): RelayRuntime.Selector | null;

/**
 * Given a mapping of keys -> results and a mapping of keys -> fragments,
 * extracts the merged variables that would be in scope for those
 * fragments/results.
 *
 * This can be useful in determing what varaibles were used to fetch the data
 * for a Relay container, for example.
 */
export function getVariablesFromObject(
	operationVariables: RelayRuntime.Variables,
	fragments: { [key: string]: RelayRuntime.ConcreteFragment },
	object: { [key: string]: any },
): RelayRuntime.Variables;

export const ViewerHandler: {
	/**
	 * A runtime handler for the `viewer` field. The actual viewer record will
	 * *never* be accessed at runtime because all fragments that reference it will
	 * delegate to the handle field. So in order to prevent GC from having to check
	 * both the original server field *and* the handle field (which would be almost
	 * duplicate work), the handler copies server fields and then deletes the server
	 * record.
	 *
	 * NOTE: This means other handles may not be added on viewer, since they may
	 * execute after this handle when the server record is already deleted.
	 */
	update(store: RelayRuntime.RecordSourceProxy, payload: RelayRuntime.HandleFieldPayload): void;
	VIEWER_ID: string;
}

export function commitLocalUpdate(
	environment: RelayRuntime.Environment,
	updater: RelayRuntime.StoreUpdater,
): void;

export interface MutationConfig<T extends { query: any; variables: any; }> {
	configs?: Array<RelayRuntime.RelayMutationConfig>;
	mutation: RelayRuntime.GraphQLTaggedNode;
	variables: T['variables'];
	uploadables?: RelayRuntime.UploadableMap;
	onCompleted?: ((response: T['query'], errors: Array<RelayRuntime.PayloadError> | null) => void) | null;
	onError?: ((error: Error) => void) | null;
	optimisticUpdater?: RelayRuntime.SelectorStoreUpdater | null;
	optimisticResponse?: object;
	updater?: RelayRuntime.SelectorStoreUpdater | null;
}

/**
 * Higher-level helper function to execute a mutation against a specific
 * environment.
 */
export function commitMutation<T extends { query: any; variables: any; }>(
	environment: Environment,
	config: MutationConfig<T>,
): RelayRuntime.Disposable;

export function fetchQuery(
	environment: RelayRuntime.Environment,
	taggedNode: RelayRuntime.GraphQLTaggedNode,
	variables: RelayRuntime.Variables,
	cacheConfig?: RelayRuntime.CacheConfig | null,
): Promise<RelayRuntime.SelectorData | null>;

export function isRelayModernEnvironment(
	environment: RelayRuntime.Environment,
): boolean;

export interface GraphQLSubscriptionConfig {
	subscription: RelayRuntime.GraphQLTaggedNode;
	variables: RelayRuntime.Variables;
	onCompleted?: (() => void) | null;
	onError?: ((error: Error) => void) | null;
	onNext?: ((response: object | null) => void) | null;
	updater?: ((store: RelayRuntime.RecordSourceSelectorProxy) => void) | null;
}

export function requestSubscription(
	environment: RelayRuntime.Environment,
	config: GraphQLSubscriptionConfig,
): RelayRuntime.Disposable;

interface GraphQLFunction {
	(
		parts: TemplateStringsArray,
		...tpl: never[],
	): RelayRuntime.GraphQLTaggedNode;
	experimental(
		parts: TemplateStringsArray,
		...tpl: never[],
	): RelayRuntime.GraphQLTaggedNode
}

export const graphql: GraphQLFunction;

export as namespace RelayRuntime;
export type RecordSourceSelectorProxy = RelayRuntime.RecordSourceSelectorProxy;
export type RecordProxy = RelayRuntime.RecordProxy;

export class Store implements RelayRuntime.Store {
	constructor(source: RelayRuntime.MutableRecordSource);
	getSource(): RelayRuntime.RecordSource;
	check(selector: RelayRuntime.CSelector<RelayRuntime.ConcreteSelectableNode>): boolean;
	lookup(selector: RelayRuntime.CSelector<RelayRuntime.ConcreteSelectableNode>): RelayRuntime.CSnapshot<RelayRuntime.ConcreteSelectableNode>;
	notify(): void;
	publish(source: RelayRuntime.RecordSource): void;
	resolve(target: RelayRuntime.MutableRecordSource, selector: RelayRuntime.CSelector<RelayRuntime.ConcreteSelectableNode>, callback: RelayRuntime.AsyncLoadCallback): void;
	retain(selector: RelayRuntime.CSelector<RelayRuntime.ConcreteSelectableNode>): RelayRuntime.Disposable;
	subscribe(snapshot: RelayRuntime.CSnapshot<RelayRuntime.ConcreteSelectableNode>, callback: (snapshot: RelayRuntime.CSnapshot<RelayRuntime.ConcreteSelectableNode>) => void): RelayRuntime.Disposable;
}

export class RecordSource implements RelayRuntime.MutableRecordSource {
	constructor();
	clear(): void;
	delete(dataID: string): void;
	remove(dataID: string): void;
	set(dataID: string, record: RelayRuntime.Record): void;
	get(dataID: string): RelayRuntime.Record | null;
	getRecordIDs(): string[];
	getStatus(dataID: string): RelayRuntime.RecordState;
	has(dataID: string): boolean;
	load(dataID: string, callback: (error: Error | null, record: RelayRuntime.Record | null) => void): void;
	size(): number;
}
