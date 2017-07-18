/**
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only.  Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {
	graphql,
	QueryRenderer,
	ReadyState,
} from 'react-relay';
import {
	Environment,
	Network,
	RecordSource,
	Store,
} from 'relay-runtime';

import TodoApp from './components/TodoApp';

const mountNode = document.getElementById('root');

const fetchQuery: RelayRuntime.FetchFunction = (
	operation,
	variables,
) => {
	return fetch('/graphql', {
		body: JSON.stringify({
			query: operation.text,
			variables,
		}),
		headers: {
			'Content-Type': 'application/json',
		},
		method: 'POST',
	}).then(response => {
		return response.json();
	});
};

const modernEnvironment = new Environment({
	network: Network.create(fetchQuery),
	store: new Store(new RecordSource()),
});

const query = graphql`
	query appQuery {
		viewer {
			...TodoApp_viewer
		}
	}
`;

const renderComponent: (readyState: ReadyState) => React.ReactElement<any> | null = ({ error, props }) => {
	if (props) {
		return <TodoApp viewer={(props as any).viewer} />;
	} else {
		return <div>Loading</div >;
	}
};

ReactDOM.render(
	(
		<QueryRenderer
			environment={modernEnvironment}
			query={query}
			variables={{}}
			render={renderComponent}
		/>
	),
	mountNode,
);
