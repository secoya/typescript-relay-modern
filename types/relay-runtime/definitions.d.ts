// RelayConcreteNode.js
declare namespace RelayRuntime {
	type ConcreteArgument = ConcreteLiteral | ConcreteVariable;
	type ConcreteArgumentDefinition =
		| ConcreteLocalArgument
		| ConcreteRootArgument;
	/**
	 * Represents a single ConcreteRoot along with metadata for processing it at
	 * runtime. The persisted `id` (or `text`) can be used to fetch the query,
	 * the `fragment` can be used to read the root data (masking data from child
	 * fragments), and the `query` can be used to normalize server responses.
	 *
	 * NOTE: The use of "batch" in the name is intentional, as this wrapper around
	 * the ConcreteRoot will provide a place to store multiple concrete nodes that
	 * are part of the same batch, e.g. in the case of deferred nodes or
	 * for streaming connections that are represented as distinct concrete roots but
	 * are still conceptually tied to one source query.
	 */
	interface ConcreteBatch {
		kind: 'Batch';
		fragment: ConcreteFragment;
		id: string | null;
		metadata: {[key: string]: any};
		name: string;
		query: ConcreteRoot;
		text: string | null;
	}

	interface ConcreteCondition {
		kind: 'Condition';
		passingValue: boolean;
		condition: string;
		selections: Array<ConcreteSelection>;
	}
	type ConcreteField = ConcreteScalarField | ConcreteLinkedField;
	interface ConcreteFragment {
		argumentDefinitions: Array<ConcreteArgumentDefinition>;
		kind: 'Fragment';
		metadata: {[key: string]: any} | null;
		name: string;
		selections: Array<ConcreteSelection>;
		type: string;
	}
	interface ConcreteFragmentSpread {
		args: Array<ConcreteArgument> | null;
		kind: 'FragmentSpread';
		name: string;
	}
	type ConcreteHandle = ConcreteScalarHandle | ConcreteLinkedHandle;
	interface ConcreteRootArgument {
		kind: 'RootArgument';
		name: string;
		type: string | null;
	}
	interface ConcreteInlineFragment {
		kind: 'InlineFragment';
		selections: Array<ConcreteSelection>;
		type: string;
	}
	interface ConcreteLinkedField {
		alias: string | null;
		args: Array<ConcreteArgument> | null;
		concreteType: string | null;
		kind: 'LinkedField';
		name: string;
		plural: boolean;
		selections: Array<ConcreteSelection>;
		storageKey: string | null;
	}
	interface ConcreteLinkedHandle {
		alias: string | null;
		args: Array<ConcreteArgument> | null;
		kind: 'LinkedHandle';
		name: string;
		handle: string;
		key: string;
		filters: Array<string> | null;
	}
	interface ConcreteLiteral {
		kind: 'Literal';
		name: string;
		type: string | any;
		value: any;
	}
	interface ConcreteLocalArgument {
		defaultValue: any;
		kind: 'LocalArgument';
		name: string;
		type: string;
	}
	type ConcreteNode =
		| ConcreteCondition
		| ConcreteLinkedField
		| ConcreteFragment
		| ConcreteInlineFragment
		| ConcreteRoot;
	interface ConcreteRoot {
		argumentDefinitions: Array<ConcreteLocalArgument>;
		kind: 'Root';
		name: string;
		operation: 'mutation' | 'query' | 'subscription';
		selections: Array<ConcreteSelection>;
	}
	interface ConcreteScalarField {
		alias: string | null;
		args: Array<ConcreteArgument> | null;
		kind: 'ScalarField';
		name: string;
		storageKey: string | null;
	}
	interface ConcreteScalarHandle {
		alias: string | null;
		args: Array<ConcreteArgument> | null;
		kind: 'ScalarHandle';
		name: string;
		handle: string;
		key: string;
		filters: Array<string> | null;
	}
	type ConcreteSelection =
		| ConcreteCondition
		| ConcreteField
		| ConcreteFragmentSpread
		| ConcreteHandle
		| ConcreteInlineFragment;

	interface ConcreteVariable {
		kind: 'Variable';
		name: string;
		type: string | null;
		variableName: string;
	}
	type ConcreteSelectableNode = ConcreteFragment | ConcreteRoot;
	type GeneratedNode = ConcreteBatch | ConcreteFragment;
}

// RelayInternalTypes.js
declare namespace RelayRuntime {
	type DataID = string;
}

// RelayTypes.js
declare namespace RelayRuntime {
	type Variables = {[name: string]: any};
}

// RelayCombinedEnvironmentTypes.js
declare namespace RelayRuntime {
	/**
	 * Settings for how a query response may be cached.
	 *
	 * - `force`: causes a query to be issued unconditionally, irrespective of the
	 *   state of any configured response cache.
	 * - `poll`: causes a query to live update by polling at the specified interval
			 in milliseconds. (This value will be passed to setTimeout.)
	*/
	type CacheConfig = {
		force?: boolean | null;
		poll?: number | null;
	};

	/**
	 * Represents any resource that must be explicitly disposed of. The most common
	 * use-case is as a return value for subscriptions, where calling `dispose()`
	 * would cancel the subscription.
	 */
	type Disposable = {
		dispose(): void;
	};

	/**
	 * Arbitrary data e.g. received by a container as props.
	 */
	type Props = {[key: string]: any};

	/*
	* An individual cached graph object.
	*/
	type Record = {[key: string]: any};

	/**
	 * A collection of records keyed by id.
	 */
	type RecordMap = {[dataID: string]: Record | null};

	/**
	 * A selector defines the starting point for a traversal into the graph for the
	 * purposes of targeting a subgraph.
	 */
	type CSelector<TNode> = {
		dataID: DataID;
		node: TNode;
		variables: Variables;
	};

	/**
	 * A representation of a selector and its results at a particular point in time.
	 */
	type CSnapshot<TNode> = CSelector<TNode> & {
		data: SelectorData | null;
		seenRecords: RecordMap;
	};

	/**
	 * The results of a selector given a store/RecordSource.
	 */
	type SelectorData = {[key: string]: any};

	/**
	 * The results of reading the results of a FragmentMap given some input
	 * `Props`.
	 */
	type FragmentSpecResults = {[key: string]: any};

	/**
	 * A utility for resolving and subscribing to the results of a fragment spec
	 * (key -> fragment mapping) given some "props" that determine the root ID
	 * and variables to use when reading each fragment. When props are changed via
	 * `setProps()`, the resolver will update its results and subscriptions
	 * accordingly. Internally, the resolver:
	 * - Converts the fragment map & props map into a map of `Selector`s.
	 * - Removes any resolvers for any props that became null.
	 * - Creates resolvers for any props that became non-null.
	 * - Updates resolvers with the latest props.
	 */
	interface FragmentSpecResolver {
		/**
		 * Stop watching for changes to the results of the fragments.
		 */
		dispose(): void;

		/**
		 * Get the current results.
		 */
		resolve(): FragmentSpecResults;

		/**
		 * Update the resolver with new inputs. Call `resolve()` to get the updated
		 * results.
		 */
		setProps(props: Props): void;

		/**
		 * Override the variables used to read the results of the fragments. Call
		 * `resolve()` to get the updated results.
		 */
		setVariables(variables: Variables): void;
	}

	type CFragmentMap<TFragment> = {[key: string]: TFragment};

	/**
	 * An operation selector describes a specific instance of a GraphQL operation
	 * with variables applied.
	 *
	 * - `root`: a selector intended for processing server results or retaining
	 *   response data in the store.
	 * - `fragment`: a selector intended for use in reading or subscribing to
	 *   the results of the the operation.
	 */
	type COperationSelector<TNode, TOperation> = {
		fragment: CSelector<TNode>;
		node: TOperation;
		root: CSelector<TNode>;
		variables: Variables;
	};

	/**
	 * The public API of Relay core. Represents an encapsulated environment with its
	 * own in-memory cache.
	 */
	interface CEnvironment<
		TEnvironment,
		TFragment,
		TGraphQLTaggedNode,
		TNode,
		TOperation,
		TPayload,
	> {
		/**
		 * Read the results of a selector from in-memory records in the store.
		 */
		lookup(selector: CSelector<TNode>): CSnapshot<TNode>;

		/**
		 * Subscribe to changes to the results of a selector. The callback is called
		 * when data has been committed to the store that would cause the results of
		 * the snapshot's selector to change.
		 */
		subscribe(
			snapshot: CSnapshot<TNode>,
			callback: (snapshot: CSnapshot<TNode>) => void,
		): Disposable;

		/**
		 * Ensure that all the records necessary to fulfill the given selector are
		 * retained in-memory. The records will not be eligible for garbage collection
		 * until the returned reference is disposed.
		 *
		 * Note: This is a no-op in the classic core.
		 */
		retain(selector: CSelector<TNode>): Disposable;

		/**
		 * Send a query to the server with request/response semantics: the query will
		 * either complete successfully (calling `onNext` and `onCompleted`) or fail
		 * (calling `onError`).
		 *
		 * Note: Most applications should use `streamQuery` in order to
		 * optionally receive updated information over time, should that feature be
		 * supported by the network/server. A good rule of thumb is to use this method
		 * if you would otherwise immediately dispose the `streamQuery()`
		 * after receving the first `onNext` result.
		 */
		sendQuery(config: {
			cacheConfig?: CacheConfig | null;
			onCompleted?: (() => void) | null;
			onError?: ((error: Error) => void) | null;
			onNext?: ((payload: TPayload) => void) | null;
			operation: COperationSelector<TNode, TOperation>;
		}): Disposable,

		/**
		 * Send a query to the server with request/subscription semantics: one or more
		 * responses may be returned (via `onNext`) over time followed by either
		 * the request completing (`onCompleted`) or an error (`onError`).
		 *
		 * Networks/servers that support subscriptions may choose to hold the
		 * subscription open indefinitely such that `onCompleted` is not called.
		 */
		streamQuery(config: {
			cacheConfig?: CacheConfig | null;
			onCompleted?: (() => void) | null;
			onError?: ((error: Error) => void) | null;
			onNext?: ((payload: TPayload) => void) | null;
			operation: COperationSelector<TNode, TOperation>;
		}): Disposable,
	}

	interface CUnstableEnvironmentCore<
		TEnvironment,
		TFragment,
		TGraphQLTaggedNode,
		TNode,
		TOperation,
	> {
		/**
		 * Create an instance of a FragmentSpecResolver.
		 *
		 * TODO: The FragmentSpecResolver *can* be implemented via the other methods
		 * defined here, so this could be moved out of core. It's convenient to have
		 * separate implementations until the experimental core is in OSS.
		 */
		createFragmentSpecResolver: (
			context: CRelayContext<TEnvironment>,
			containerName: string,
			fragments: CFragmentMap<TFragment>,
			props: Props,
			callback: () => void,
		) => FragmentSpecResolver;

		/**
		 * Creates an instance of an OperationSelector given an operation definition
		 * (see `getOperation`) and the variables to apply. The input variables are
		 * filtered to exclude variables that do not matche defined arguments on the
		 * operation, and default values are populated for null values.
		 */
		createOperationSelector: (
			operation: TOperation,
			variables: Variables,
		) => COperationSelector<TNode, TOperation>;

		/**
		 * Given a graphql`...` tagged template, extract a fragment definition usable
		 * by this version of Relay core. Throws if the value is not a fragment.
		 */
		getFragment: (node: TGraphQLTaggedNode) => TFragment;

		/**
		 * Given a graphql`...` tagged template, extract an operation definition
		 * usable by this version of Relay core. Throws if the value is not an
		 * operation.
		 */
		getOperation: (node: TGraphQLTaggedNode) => TOperation;

		/**
		 * Determine if two selectors are equal (represent the same selection). Note
		 * that this function returns `false` when the two queries/fragments are
		 * different objects, even if they select the same fields.
		 */
		areEqualSelectors: (a: CSelector<TNode>, b: CSelector<TNode>) => boolean;

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
		getSelector: (
			operationVariables: Variables,
			fragment: TFragment,
			prop: any,
		) => CSelector<TNode> | null;

		/**
		 * Given the result `items` from a parent that fetched `fragment`, creates a
		 * selector that can be used to read the results of that fragment on those
		 * items. This is similar to `getSelector` but for "plural" fragments that
		 * expect an array of results and therefore return an array of selectors.
		 */
		getSelectorList: (
			operationVariables: Variables,
			fragment: TFragment,
			props: Array<any>,
		) => Array<CSelector<TNode>> | null;

		/**
		 * Given a mapping of keys -> results and a mapping of keys -> fragments,
		 * extracts the selectors for those fragments from the results.
		 *
		 * The canonical use-case for this function are Relay Containers, which
		 * use this function to convert (props, fragments) into selectors so that they
		 * can read the results to pass to the inner component.
		 */
		getSelectorsFromObject: (
			operationVariables: Variables,
			fragments: CFragmentMap<TFragment>,
			props: Props,
		) => {[key: string]: (CSelector<TNode> | Array<CSelector<TNode>>) | null};

		/**
		 * Given a mapping of keys -> results and a mapping of keys -> fragments,
		 * extracts a mapping of keys -> id(s) of the results.
		 *
		 * Similar to `getSelectorsFromObject()`, this function can be useful in
		 * determining the "identity" of the props passed to a component.
		 */
		getDataIDsFromObject: (
			fragments: CFragmentMap<TFragment>,
			props: Props,
		) => {[key: string]: (DataID | Array<DataID>) | null};

		/**
		 * Given a mapping of keys -> results and a mapping of keys -> fragments,
		 * extracts the merged variables that would be in scope for those
		 * fragments/results.
		 *
		 * This can be useful in determing what varaibles were used to fetch the data
		 * for a Relay container, for example.
		 */
		getVariablesFromObject: (
			operationVariables: Variables,
			fragments: CFragmentMap<TFragment>,
			props: Props,
		) => Variables;
	}

	/**
	 * The type of the `relay` property set on React context by the React/Relay
	 * integration layer (e.g. QueryRenderer, FragmentContainer, etc).
	 */
	type CRelayContext<TEnvironment> = {
		environment: TEnvironment,
		variables: Variables,
	};
}

// RelayModernGraphQLTag.js
declare namespace RelayRuntime {
	type GraphQLTaggedNode =
  | (() => ConcreteFragment | ConcreteBatch)
  | {
      modern: () => ConcreteFragment | ConcreteBatch;
      classic: any;
    };
}

// RelayRecordState.js
declare namespace RelayRuntime {
	type RecordState = 'EXISTENT' | 'NONEXISTENT' | 'UNKNOWN';
}

// RelayNetworkTypes.js
declare namespace RelayRuntime {
	/**
	 * A cache for saving respones to queries (by id) and variables.
	 */
	interface ResponseCache {
		get(id: string, variables: Variables): QueryPayload | null;
		set(id: string, variables: Variables, payload: QueryPayload): void;
	}

	/**
	 * An interface for fetching the data for one or more (possibly interdependent)
	 * queries.
	 */
	interface Network {
		fetch: FetchFunction;
		request: RequestResponseFunction;
		requestStream: RequestStreamFunction;
	}

	type PayloadData = {[key: string]: any};

	type PayloadError = {
		message: string;
		locations?: Array<{
			line: number;
			column: number;
		}>;
	};

	/**
	 * The shape of a GraphQL response as dictated by the
	 * [spec](http://facebook.github.io/graphql/#sec-Response)
	 */
	interface QueryPayload {
		data?: PayloadData | null;
		errors?: Array<PayloadError>;
	}

	/**
	 * The shape of data that is returned by the Relay network layer for a given
	 * query.
	 */
	interface RelayResponsePayload {
		fieldPayloads?: Array<HandleFieldPayload> | null;
		source: MutableRecordSource;
		errors: Array<PayloadError> | null;
	}

	type PromiseOrValue<T> = Promise<T> | T | Error;

	/**
	 * A function that executes a GraphQL operation with request/response semantics,
	 * with exactly one raw server response returned
	 */
	type FetchFunction = (
		operation: ConcreteBatch,
		variables: Variables,
		cacheConfig: CacheConfig | null,
		uploadables?: UploadableMap,
	) => PromiseOrValue<QueryPayload>;

	/**
	 * A function that executes a GraphQL operation with request/subscription
	 * semantics, returning one or more raw server responses over time.
	 */
	type SubscribeFunction = (
		operation: ConcreteBatch,
		variables: Variables,
		cacheConfig: CacheConfig | null,
		observer: Observer<QueryPayload>,
	) => Disposable;

	/**
	 * A function that executes a GraphQL operation with request/subscription
	 * semantics, returning one or more responses over time that include the
	 * initial result and optional updates e.g. as the results of the operation
	 * change.
	 */
	type RequestStreamFunction = (
		operation: ConcreteBatch,
		variables: Variables,
		cacheConfig: CacheConfig | null,
		observer: Observer<RelayResponsePayload>,
	) => Disposable;

	/**
	 * A function that executes a GraphQL operation with request/response semantics,
	 * with exactly one response returned.
	 */
	type RequestResponseFunction = (
		operation: ConcreteBatch,
		variables: Variables,
		cacheConfig?: CacheConfig | null,
		uploadables?: UploadableMap,
	) => PromiseOrValue<RelayResponsePayload>;

	type Uploadable = File | Blob;
	// $FlowFixMe this is compatible with classic api see D4658012
	type UploadableMap = {[key: string]: Uploadable};
}

// RelayStoreTypes.js
declare namespace RelayRuntime {
	type FragmentMap = CFragmentMap<ConcreteFragment>;
	type OperationSelector = COperationSelector<ConcreteSelectableNode, ConcreteBatch>;
	type RelayContext = CRelayContext<Environment>;
	type Selector = CSelector<ConcreteSelectableNode>;
	type Snapshot = CSnapshot<ConcreteSelectableNode>;
	type UnstableEnvironmentCore = CUnstableEnvironmentCore<
		Environment,
		ConcreteFragment,
		GraphQLTaggedNode,
		ConcreteSelectableNode,
		ConcreteBatch
	>;

	/**
	 * A read-only interface for accessing cached graph data.
	 */
	interface RecordSource {
		get(dataID: DataID): Record | null;
		getRecordIDs(): Array<DataID>;
		getStatus(dataID: DataID): RecordState;
		has(dataID: DataID): boolean;
		load(
			dataID: DataID,
			callback: (error: Error | null, record: Record | null) => void,
		): void;
		size(): number;
	}

	/**
	 * A read/write interface for accessing and updating graph data.
	 */
	interface MutableRecordSource extends RecordSource {
		clear(): void,
		delete(dataID: DataID): void,
		remove(dataID: DataID): void,
		set(dataID: DataID, record: Record): void,
	}

	/**
	 * An interface for keeping multiple views of data consistent across an
	 * application.
	 */
	interface Store {
		/**
		 * Get a read-only view of the store's internal RecordSource.
		 */
		getSource(): RecordSource,

		/**
		 * Determine if the selector can be resolved with data in the store (i.e. no
		 * fields are missing).
		 */
		check(selector: Selector): boolean,

		/**
		 * Read the results of a selector from in-memory records in the store.
		 */
		lookup(selector: Selector): Snapshot,

		/**
		 * Notify subscribers (see `subscribe`) of any data that was published
		 * (`publish()`) since the last time `notify` was called.
		 */
		notify(): void,

		/**
		 * Publish new information (e.g. from the network) to the store, updating its
		 * internal record source. Subscribers are not immediately notified - this
		 * occurs when `notify()` is called.
		 */
		publish(source: RecordSource): void,

		/**
		 * Attempts to load all the records necessary to fulfill the selector into the
		 * target record source.
		 */
		resolve(
			target: MutableRecordSource,
			selector: Selector,
			callback: AsyncLoadCallback,
		): void,

		/**
		 * Ensure that all the records necessary to fulfill the given selector are
		 * retained in-memory. The records will not be eligible for garbage collection
		 * until the returned reference is disposed.
		 */
		retain(selector: Selector): Disposable,

		/**
		 * Subscribe to changes to the results of a selector. The callback is called
		 * when `notify()` is called *and* records have been published that affect the
		 * selector results relative to the last `notify()`.
		 */
		subscribe(
			snapshot: Snapshot,
			callback: (snapshot: Snapshot) => void,
		): Disposable,
	}

	/**
	 * An interface for imperatively getting/setting properties of a `Record`. This interface
	 * is designed to allow the appearance of direct Record manipulation while
	 * allowing different implementations that may e.g. create a changeset of
	 * the modifications.
	 */
	interface RecordProxy {
		copyFieldsFrom(source: RecordProxy): void,
		getDataID(): DataID,
		getLinkedRecord(name: string, args?: Variables | null): RecordProxy | null;
		getLinkedRecords(name: string, args?: Variables | null): Array<RecordProxy | null> | null;
		getOrCreateLinkedRecord(
			name: string,
			typeName: string,
			args?: Variables | null,
		): RecordProxy;
		getType(): string;
		getValue(name: string, args?: Variables | null): any;
		setLinkedRecord(
			record: RecordProxy,
			name: string,
			args?: Variables | null,
		): RecordProxy;
		setLinkedRecords(
			records: Array<RecordProxy | null>,
			name: string,
			args?: Variables | null,
		): RecordProxy,
		setValue(value: any, name: string, args?: Variables | null): RecordProxy;
	}

	/**
	 * An interface for imperatively getting/setting properties of a `RecordSource`. This interface
	 * is designed to allow the appearance of direct RecordSource manipulation while
	 * allowing different implementations that may e.g. create a changeset of
	 * the modifications.
	 */
	interface RecordSourceProxy {
		create(dataID: DataID, typeName: string): RecordProxy;
		delete(dataID: DataID): void;
		get(dataID: DataID): RecordProxy | null;
		getRoot(): RecordProxy;
	}

	/**
	 * Extends the RecordSourceProxy interface with methods for accessing the root
	 * fields of a Selector.
	 */
	interface RecordSourceSelectorProxy {
		create(dataID: DataID, typeName: string): RecordProxy;
		delete(dataID: DataID): void;
		get(dataID: DataID): RecordProxy | null;
		getRoot(): RecordProxy;
		getRootField(fieldName: string): RecordProxy | null;
		getPluralRootField(fieldName: string): Array<RecordProxy | null> | null,
	}

	/**
	 * The public API of Relay core. Represents an encapsulated environment with its
	 * own in-memory cache.
	 */
	interface Environment
		extends CEnvironment<
			Environment,
			ConcreteFragment,
			GraphQLTaggedNode,
			ConcreteSelectableNode,
			ConcreteBatch,
			RelayResponsePayload
		> {
		/**
		 * Apply an optimistic update to the environment. The mutation can be reverted
		 * by calling `dispose()` on the returned value.
		 */
		applyUpdate(updater: StoreUpdater): Disposable;

		/**
		 * Determine if the selector can be resolved with data in the store (i.e. no
		 * fields are missing).
		 *
		 * Note that this operation effectively "executes" the selector against the
		 * cache and therefore takes time proportional to the size/complexity of the
		 * selector.
		 */
		check(selector: Selector): boolean;

		/**
		 * Commit an updater to the environment. This mutation cannot be reverted and
		 * should therefore not be used for optimistic updates. This is mainly
		 * intended for updating fields from client schema extensions.
		 */
		commitUpdate(updater: StoreUpdater): void;

		/**
		 * Commit a payload to the environment using the given operation selector.
		 */
		commitPayload(
			operationSelector: OperationSelector,
			payload: PayloadData,
		): void;

		/**
		 * Get the environment's internal Store.
		 */
		getStore(): Store,

		/**
		 * Send a mutation to the server. If provided, the optimistic updater is
		 * executed immediately and reverted atomically when the server payload is
		 * committed.
		 */
		sendMutation(config: {
			onCompleted?: ((errors: Array<PayloadError> | null) => void) | null;
			onError?: ((error: Error) => void) | null;
			operation: OperationSelector;
			optimisticResponse?: Object;
			optimisticUpdater?: SelectorStoreUpdater | null;
			updater?: SelectorStoreUpdater | null;
			uploadables?: UploadableMap;
		}): Disposable;

		/**
		 * Send a (GraphQL) subscription to the server. Whenever there is a push from
		 * the server, commit the update to the environment.
		 */
		sendSubscription(config: {
			onCompleted?: ((errors: Array<PayloadError> | null) => void) | null,
			onNext?: ((payload: RelayResponsePayload) => void) | null,
			onError?: ((error: Error) => void) | null,
			operation: OperationSelector,
			updater?: SelectorStoreUpdater | null,
		}): Disposable,
	}

	type Observer<T> = {
		onCompleted?: (() => void) | null;
		onError?: ((error: Error) => void) | null;
		onNext?: ((data: T) => void) | null;
	};

	/**
	 * The results of reading data for a fragment. This is similar to a `Selector`,
	 * but references the (fragment) node by name rather than by value.
	 */
	type FragmentPointer = {
		__id: DataID;
		__fragments: {[fragmentName: string]: Variables};
	};

	/**
	 * A callback for resolving a Selector from a source.
	 */
	type AsyncLoadCallback = (loadingState: LoadingState) => void;
	interface LoadingState {
		status: 'aborted' | 'complete' | 'error' | 'missing';
		error?: Error;
	}

	/**
	 * A map of records affected by an update operation.
	 */
	type UpdatedRecords = {[dataID: string]: boolean};

	/**
	 * A function that updates a store (via a proxy) given the results of a "handle"
	 * field payload.
	 */
	type Handler = {
		update: (store: RecordSourceProxy, fieldPayload: HandleFieldPayload) => void;
	};

	/**
	 * A payload that is used to initialize or update a "handle" field with
	 * information from the server.
	 */
	interface HandleFieldPayload {
		// The arguments that were fetched.
		args: Variables;
		// The __id of the record containing the source/handle field.
		dataID: DataID;
		// The (storage) key at which the original server data was written.
		fieldKey: string;
		// The name of the handle.
		handle: string;
		// The (storage) key at which the handle's data should be written by the
		// handler.
		handleKey: string;
	}

	/**
	 * A function that receives a proxy over the store and may trigger side-effects
	 * (indirectly) by calling `set*` methods on the store or its record proxies.
	 */
	type StoreUpdater = (store: RecordSourceProxy) => void;

	/**
	 * Similar to StoreUpdater, but accepts a proxy tied to a specific selector in
	 * order to easily access the root fields of a query/mutation as well as a
	 * second argument of the response object of the mutation.
	 */
	type SelectorStoreUpdater = (
		store: RecordSourceSelectorProxy,
		// Actually RelayCombinedEnvironmentTypes#SelectorData, but mixed is
		// inconvenient to access deeply in product code.
		data: SelectorData,
	) => void;

}

// RelayDefaultHandlerProvider.js
declare namespace RelayRuntime {
	type HandlerProvider = (name: string) => Handler | null;
}

// RelayModernEnvironment.js
declare namespace RelayRuntime {
	type EnvironmentConfig = {
		handlerProvider?: HandlerProvider,
		network: Network,
		store: Store,
	};
}

// RelayTypes.js
declare namespace RelayRuntime {
	type RangeOperations = 'prepend' | 'append' | 'ignore' | 'remove' | 'refetch';
	type RangeBehaviorsObject = {
		[key: string]: RangeOperations;
	};
	type RangeBehaviors = RangeBehaviorsFunction | RangeBehaviorsObject;
	type RangeBehaviorsFunction = (connectionArgs: {
  [argName: string]: CallValue,
}) => RangeOperations;

	type CallValue =
		| boolean
		| number
		| string
		| object
		| any[]
		| null;
	// Containers
	type RelayMutationConfig =
		| {
				type: 'FIELDS_CHANGE',
				fieldIDs: {[fieldName: string]: DataID | Array<DataID>},
			}
		| {
				type: 'RANGE_ADD',
				parentName?: string,
				parentID?: string,
				connectionInfo?: Array<{
					key: string,
					filters?: Variables,
					rangeBehavior: string,
				}>,
				connectionName?: string,
				edgeName: string,
				rangeBehaviors?: RangeBehaviors,
			}
		| {
				type: 'NODE_DELETE',
				parentName?: string,
				parentID?: string,
				connectionName?: string,
				deletedIDFieldName: string,
			}
		| {
				type: 'RANGE_DELETE',
				parentName?: string,
				parentID?: string,
				connectionKeys?: Array<{
					key: string,
					filters?: Variables,
				}>,
				connectionName?: string,
				deletedIDFieldName: string | Array<string>,
				pathToConnection: Array<string>,
			};
}

export as namespace RelayRuntime;
export = RelayRuntime;
