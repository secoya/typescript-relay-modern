# Relay Modern TodoMVC with TypeScript #

This is an example application showing one of many ways to integrate TypeScript with Relay Modern.

The application code is copy/pasted from [Relay examples](https://github.com/relayjs/relay-examples) - all copyright on the application code goes to the appropriate copyright holders.

This repository also serves (together with [the fork of the relay code base at (secoya/relay)](https://github.com/secoya/relay) - that contains modifications to the compiler) as an example of which possible extensions could be needed in the Relay compiler.

## Credits ##

Monster credits to [s-panferov](https://github.com/s-panferov) - for work on the pull request to add transforms to the relay compiler and his initial implementation of this. We have forked the implementation only to publish a package to be able to play with this.

## How to use/test ##

Clone the repository then run:

```bash
npm install
npm run update-schema
npm run generate-vendor-bundle
npm run build
npm start
```

In another terminal window you can then run:

```bash
npm run watch
```

To run the relay-compiler.

## Details ##

In order to generate TypeScript types for the GraphQL queries, this repository uses a package already in use at Secoya, written by one of our employees [graphql-fragment-type-generator](https://git.input-output.dk/strong-graphql/graphql-fragment-type-generator). A proper TypeScript integration would probably work on the RelayIR to do this. Without having looked too much into this, it would probably be fairly straight forward to do as well. One difference in this regard is that the official flow types in Relay does not type up the difference between the props accessible to a component and the props other components rendering a component must provide.

Consider the following:

Todo.js
```jsx
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
class Todo extends React.Component {
	render() {
		return <div>{this.props.todo.text}</div>;
	}
}

export default createFragmentContainer(
	Todo,
	graphql`fragment Todo_todo on Todo { text }`,
);
```

TodoContainer.js
```jsx
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import Todo from './Todo';
class TodoContainer extends React.Component {
	render() {
		return <div><div>Todo:</div><Todo todo={this.props.todo} /></div>;
	}
}

export default createFragmentContainer(
	TodoContainer,
	graphql`fragment TodoContainer_todo on Todo { ...Todo_todo }`,
);
```

In this example it is worth noting a couple of things. The runtime prop types for the two components look like this (given a schema where `Todo` has a field called `text` of type `String!`:

```typescript
type TodoProps = {
	todo: {
		text: string;
	};
}

type TodoContainerProps = {
	todo: {}
}
```

However, inside `TodoContainer` we pass the `todo` prop to the `Todo` component - and this should work, both at runtime *and* compile time. This example should work in this repository - as well as more complex ones. We do this by "branding" every object type being generated - in order to be able to distinguish between `Todo`, `User` and other types. Through some usages of generics we let these types flow through the system - to ensure that only `Todo` objects are passed to the `Todo` component - but allowing them no matter what properties are available to them.

## Overview of the system ##

There are several moving parts in this specific setup.

1. Typescript type generation for every fragment, query, mutation and subscription.
2. Typescript transform to replace `babel-plugin-relay`.
3. Typescript type definitions for `react-relay` and `relay-runtime` packages, including types of pseudo classes `FragmentContainer`, `RefetchContainer` and `PaginationContainer` (these are defined in `types/react-relay/definitions.d.ts` and does not actually exist at runtime).
4. Typescript code generation in a globally accessible namespace (named `Relay`) with pseudo component classes for every container found in the code base (ie. `Relay.TodoFragmentContainer`).
5. Typescript transform to change every class declaration that extends a pseudo container into extending `React.Component`.
6. A schema definition file (`graphql-schema`) containing type brands (empty enums) and other schema helper types.

### 1. Typescript type generation for every fragment, query, mutation and subscription. ###

This work very much like the original Relay compiler. Ie. here's the generated file output of this fragment:

```graphql
	fragment Todo_todo on Todo {
		complete
		id
		text
	}
```

Todo_todo.graphql.ts
```typescript
/**
 * @flow
 */
 // tslint:disable
import { Todo } from 'graphql-schema';

export type Todo_todo = {
  '': Todo;

  complete: boolean | null;

  /**
   * The ID of an object
   */
  id: string;

  text: string | null;
};

export type Todo_todo_brand = {
  '': Todo;
};



/* eslint-disable */

'use strict';

/*::
import type {ConcreteFragment} from 'relay-runtime';
export type Todo_todo = {|
  +complete: ?boolean;
  +id: string;
  +text: ?string;
|};
*/


const fragment /*: ConcreteFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "Todo_todo",
  "selections": [
    {
      "kind": "ScalarField",
      "alias": null,
      "args": null,
      "name": "complete",
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "args": null,
      "name": "id",
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "args": null,
      "name": "text",
      "storageKey": null
    }
  ],
  "type": "Todo"
};
export default fragment;
```

We here see both the flow types (that the relay compiler generates) and the new TypeScript types generated by `graphql-fragment-type-generator`. We also see the branding of the types happening. Lastly the actual needed runtime data is generated.

These types are not really meant for you consume - although you could - some much nicer types are generated for that purpose, read on.

### 2. Typescript transform to replace `babel-plugin-relay` ###

Just like the `babel-plugin-relay` transforms `graphql` template literals to calls to `require` - this transform does exactly the same.

### 3. Typescript type definitions for `react-relay` and `relay-runtime` packages ###

These are mainly the flow types (extracted from the package source code) - with some added generic types to make the final step here easier. Of real interest here is that there's classes defined that only exists at compile time - which is used later on to make the types of our containes flow through the system.

### 4. Typescript code generation in a globally accessible namespace (named `Relay`) ###

This is where the real beauty begins. For every container (fragment, refetch or pagination) in your codebase you will have several types available on the global accessible `Relay` namespace.

For a simple `Todo` component defining two fragments `Todo_todo` and `Todo_viewer` the following types are generated:

```typescript
    import { Todo_todo, Todo_todo_brand } from 'generated/Todo_todo.graphql';
    import { Todo_viewer, Todo_viewer_brand } from 'generated/Todo_viewer.graphql';

    export type TodoFragmentContainerProps<Props> = ReactRelay.FragmentContainerProps<{ todo: Todo_todo } & { viewer: Todo_viewer }
, Props>
    export abstract class TodoFragmentContainer<Props = {}, State = {}> extends ReactRelay.FragmentContainer<{ todo: Todo_todo } & { viewer: Todo_viewer }, { todo: Todo_todo_brand } & { viewer: Todo_viewer_brand }, Props, State> { }
    export type TodoRefetchContainerProps<Props, RefetchQuery extends ReactRelay.BaseQuery> = ReactRelay.RefetchContainerProps<{ todo: Todo_todo } & { viewer: Todo_viewer }
, Props, RefetchQuery>
    export abstract class TodoRefetchContainer<RefetchQuery extends ReactRelay.BaseQuery, Props = {}, State = {}> extends ReactRelay.RefetchContainer<{ todo: Todo_todo } & { viewer: Todo_viewer }, { todo: Todo_todo_brand } & { viewer: Todo_viewer_brand }, Props, State, RefetchQuery> { }
    export type TodoPaginationContainerProps<Props, PaginationQuery extends ReactRelay.BaseQuery> = ReactRelay.PaginationContainerProps<{ todo: Todo_todo } & { viewer: Todo_viewer }
, Props, PaginationQuery>
    export abstract class TodoPaginationContainer<PaginationQuery extends ReactRelay.BaseQuery, Props = {}, State = {}> extends ReactRelay.PaginationContainer<{ todo: Todo_todo } & { viewer: Todo_viewer }, { todo: Todo_todo_brand } & { viewer: Todo_viewer_brand }, Props, State, PaginationQuery> { }
    export type TodoAppFragmentContainerProps<Props> = ReactRelay.FragmentContainerProps<{ viewer: TodoApp_viewer }
, Props>
```

This looks very scary when written out like that, here the same types are, but with only the API we care about written out (given that this is a simple fragment container to be used with `createFragmentContainer`):

* `TodoFragmentContainerProps<Props>`:
   * This type is useful if you need to type function parameters to have the same type as `this.props` inside your component.
* `TodoFragmentContainer<Props = {}, State = {}>`:
   * To create your TodoContainer extend from this class. You can provide types for your props as well as state as usual. However you should not define props for `todo`, `viewer` or `relay`, these will have the correct types (and be updated if your fragments update!).

These are the APIs for a simple fragment container, so if we wanted to define our `Todo` component to take one additional property `highlight: boolean` we could do it like this:

```typescript
import * as React from 'react';
import ViewerInfo from './ViewerInfo';
interface Props {
	highlight: boolean;
}
class Todo extends Relay.TodoFragmentContainer<Props> {
	public render() {
		return <div style={{backgroundColor: this.props.highlight ? 'yellow' : 'transparent'}}>
			<ViewerInfo viewer={this.props.viewer} />
			{this.props.todo.text}
		</div>;
	}
}

export default createFragmentContainer(
	Todo,
	{
		todo: graphql`fragment Todo_todo on Todo { text }`,
		viewer: graphql`fragment Todo_viewer on User { ... ViewerInfo_viewer }`,
	},
);
```

This of course assumes that `ViewerInfo` exists. For refetch and pagination containers similiar types are generated (named as such). Only difference is that as a first parameter they take a `Query` generic type. The proper object for this query is the one named the same as the RefetchQuery or PaginationQuery specified in `createPaginationContainer` or `createRefetchContainer`.

### 5. Typescript transform to change every class declaration that extends a pseudo container into extending `React.Component` ###

This one is quite simple. Before converting the TypeScript code to JavaScript code - for every class that extends `Relay.*Container` replace this with `React.Component` as the pseudo container classes do actually not have a run time representation. You do not need to worry about this - except that you need to know that you can't use the pseudo classes for anything but extending other classes from them.

### 6. A schema definition file (`graphql-schema`) containing type brands (empty enums) and other schema helper types ###

Generated at `types/graphql-schema.d.ts` is a simple file containing empty enums for every object type in our schema. It also has types generated to match the input objects defined in our schema to be able to type up variables needed for fragments and operations.

## Challenges in the implementation ##

There has been a few challenges in the implementation:

### Transform module for `relay-compiler` ###

The relay-compiler assumes that it can read the input files using a standard JavaScript parser. TypeScript cannot be parsed like this and as such we need a simple transformation module. See [Pull request #1710 in facebook/relay](https://github.com/facebook/relay/pull/1710). I have applied the patch in that pull request to the commit released as relay-compiler@1.1.0 and used the linked `relay-compiler-typescript` source code provided by [s-panferov](https://github.com/s-panferov). Thank you!

### Custom file extension ###

This one was pretty simple - teach `relay-compiler` to output files with a custom file extension.

### extra content generation module ###

The Relay compiler already has an option in its API (not in the CLI options) to supply a function to call to generate extra files. This is a fine approach if one wants to traverse the RelayIR and generate files from that - and possibly could be used for what we're doing.

However as we have code operating on the GraphQL AST and not RelayIR - we have opted to add a simple extra hook that can return extra content to be injected into the generated files. We also abuse this hook to generate the `includes/relay.d.ts` file along with `types/graphql-schema.d.ts`. this probably needs a better work around in the long run.

### Ignore directives ###

`graphql-fragment-type-generator` has a useful feature that allows it to extract field selection types with a given name, using a directive (`@exportType`). There has been made simple modifications to the relay compiler to ignore these. Ideally we'd like a commandline switch to give a list of directive names to ignore.

### `outputDir` commandline switch ###

Not much to say here. The relay compiler code base can change it's output directory. Having everything in a single directory makes many things simpler in this example. We added a simple command line switch to be able to supply this option.
