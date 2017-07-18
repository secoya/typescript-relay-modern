export { commitLocalUpdate, fetchQuery, commitMutation, requestSubscription, graphql } from 'relay-runtime';
import * as RelayRuntime from 'relay-runtime/definitions';
import * as ReactRelay from 'react-relay/definitions';
import * as React from 'react';



export interface QueryRendererProps {
	cacheConfig?: RelayRuntime.CacheConfig | null;
	environment: RelayRuntime.Environment;
	query: RelayRuntime.GraphQLTaggedNode | null;
	render: (readyState: ReadyState) => React.ReactElement<any> | null;
	variables: RelayRuntime.Variables;
}
export interface ReadyState {
	error: Error | null;
	props: object | null;
	retry: (() => void) | null;
}

export class QueryRenderer extends React.Component<QueryRendererProps, {}> { }

export interface GeneratedNodeMap {
	[key: string]: RelayRuntime.GraphQLTaggedNode;
}

export function createFragmentContainer<FragmentTypes, FragmentBrandTypes, Props, State>(
	Component: ReactRelay.FragmentContainerConstructor<FragmentTypes, FragmentBrandTypes, Props, State>,
	fragmentSpec: RelayRuntime.GraphQLTaggedNode | GeneratedNodeMap,
): ReactRelay.FragmentComponent<FragmentBrandTypes, Props>;

export function createRefetchContainer<FragmentTypes, FragmentBrandTypes, Props, State, RefetchQuery extends ReactRelay.BaseQuery, Variables>(
	Component: ReactRelay.RefetchContainerConstructor<FragmentTypes, FragmentBrandTypes, Props, State, RefetchQuery, Variables>,
	fragmentspec: RelayRuntime.GraphQLTaggedNode | GeneratedNodeMap,
	refetchQuery: RelayRuntime.GraphQLTaggedNode,
): ReactRelay.RefetchComponent<FragmentBrandTypes, Props>;

export function createPaginationContainer<FragmentTypes, FragmentBrandTypes, Props, State, PaginationQuery extends ReactRelay.BaseQuery, Variables>(
	Component: ReactRelay.PaginationContainerConstructor<FragmentTypes, FragmentBrandTypes, Props, State, PaginationQuery, Variables>,
	fragmentSpec: RelayRuntime.GraphQLTaggedNode | GeneratedNodeMap,
	connectionConfig: ReactRelay.ConnectionConfig<Props, FragmentTypes, Variables, PaginationQuery>,
): ReactRelay.PaginationComponent<FragmentBrandTypes, Props>;
