import * as RelayRuntime from 'relay-runtime/definitions';
import * as React from 'react';
declare namespace ReactRelay {
	interface BaseQuery {
		query: any;
		variables: any;
	}

	type ConnectionConfig<Props, FragmentTypes, Variables, PaginationQuery extends BaseQuery> = {
		direction?: 'backward' | 'forward';
		getConnectionFromProps?: (props: Props & FragmentTypes) => ConnectionData | null;
		getFragmentVariables?: FragmentVariablesGetter<Variables>;
		getVariables: (
			props: FragmentTypes & Props,
			paginationInfo: { count: number, cursor: string | null },
			fragmentVariables: Variables,
		) => PaginationQuery['variables'];
		query: RelayRuntime.GraphQLTaggedNode;
	};

	type FragmentVariablesGetter<Variables> = (
		prevVars: Variables,
		totalCount: number,
	) => Variables;

	type ConnectionData = {
		edges?: Array<any> | null;
		pageInfo?: PageInfo | null;
	};

	type PageInfoForward = {
		endCursor: string | null;
		hasNextPage: boolean;
		hasPreviousPage?: boolean;
		startCursor?: string | null;
	};
	type PageInfoBackward = {
		endCursor?: string | null;
		hasNextPage?: boolean;
		hasPreviousPage: boolean;
		startCursor: string | null;
	};

	type PageInfo = PageInfoForward | PageInfoBackward;

	// Fragment container
	class FragmentContainer<FragmentTypes, FragmentBrandTypes, Props, State> extends React.Component<FragmentContainerProps<FragmentTypes, Props>, State> {
		private ' props': Props;
		private ' fragmentTypes': FragmentTypes;
		private ' fragmentBrandTypes': FragmentBrandTypes;
	}
	interface FragmentContainerConstructor<FragmentTypes, FragmentBrandTypes, Props, State> {
		new(props: FragmentContainerProps<FragmentTypes, Props>): FragmentContainer<FragmentTypes, FragmentBrandTypes, Props, State>;
	}
	type FragmentComponent<FragmentBrandTypes, Props> = React.ComponentType<FragmentBrandTypes & Props>;
	interface FragmentContainerRelayProp {
		environment: RelayRuntime.Environment;
	}

	type FragmentContainerProps<FragmentTypes, Props> = FragmentTypes & Props & { relay: FragmentContainerRelayProp };

	// Refetch container
	class RefetchContainer<FragmentTypes, FragmentBrandTypes, Props, State, RefetchQuery extends BaseQuery, Variables = {}> extends React.Component<RefetchContainerProps<FragmentTypes, Props, RefetchQuery, Variables>, State> {
		private ' props': Props;
		private ' fragmentTypes': FragmentTypes;
		private ' fragmentBrandTypes': FragmentBrandTypes;
		private ' refetchQuery': RefetchQuery;
		private ' variables': Variables;
	}
	interface RefetchContainerConstructor<FragmentTypes, FragmentBrandTypes, Props, State, RefetchQuery extends BaseQuery, Variables = {}> {
		new(props: RefetchContainerProps<FragmentTypes, Props, RefetchQuery, Variables>): RefetchContainer<FragmentTypes, FragmentBrandTypes, Props, State, RefetchQuery>;
	}
	type RefetchComponent<FragmentBrandTypes, Props> = React.ComponentType<FragmentBrandTypes & Props>;

	interface RefetchOptions {
		force?: boolean;
	}

	interface RefetchContainerRelayProp<RefetchQuery extends BaseQuery, Variables> {
		environment: RelayRuntime.Environment;
		refetch(
			variables: RefetchQuery['variables'] | ((fragmentVariables: Variables) => RefetchQuery['variables']),
			renderVariables?: RefetchQuery['variables'] | ((fragmentVariables: Variables) => RefetchQuery['variables']),
			callback?: (error: Error | null) => void,
			options?: RefetchOptions,
		): RelayRuntime.Disposable;
	}

	type RefetchContainerProps<FragmentTypes, Props, RefetchQuery extends BaseQuery, Variables = {}> = FragmentTypes & Props & { relay: RefetchContainerRelayProp<RefetchQuery, Variables>, };

	// Pagination container
	class PaginationContainer<FragmentTypes, FragmentBrandTypes, Props, State, PaginationQuery extends BaseQuery, Variables = {}> extends React.Component<PaginationContainerProps<FragmentTypes, Props, PaginationQuery, Variables>, State> {
		private ' props': Props;
		private ' fragmentTypes': FragmentTypes;
		private ' fragmentBrandTypes': FragmentBrandTypes;
		private ' paginationQuery': PaginationQuery;
		private ' variables': Variables;
	}
	interface PaginationContainerConstructor<FragmentTypes, FragmentBrandTypes, Props, State, PaginationQuery extends BaseQuery, Variables = {}> {
		new(props: PaginationContainerProps<FragmentTypes, Props, PaginationQuery, Variables>): PaginationContainer<FragmentTypes, FragmentBrandTypes, Props, State, PaginationQuery>;
	}
	type PaginationComponent<FragmentBrandTypes, Props> = React.ComponentType<FragmentBrandTypes & Props>;

	interface PaginationOptions {
		force?: boolean;
	}

	interface PaginationContainerRelayProp<PaginationQuery extends BaseQuery, Variables> {
		environment: RelayRuntime.Environment;
		loadMore(
			pageSize: number,
			callback?: (error: Error | null) => void,
			options?: PaginationOptions,
		): RelayRuntime.Disposable;
		isLoading(): boolean;
		hasMore(): boolean;
		refetchConnection(
			totalCount: number,
			callback: (error: Error | null) => void,
			refetchVariables?: Variables,
		): RelayRuntime.Disposable;
	}

	type PaginationContainerProps<FragmentTypes, Props, PaginationQuery extends BaseQuery, Variables = {}> = FragmentTypes & Props & { relay: PaginationContainerRelayProp<PaginationQuery, Variables>, };
}

export as namespace ReactRelay;
export = ReactRelay;
