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
import {
	commitMutation,
	graphql,
} from 'react-relay';
import { ConnectionHandler, Environment, RecordProxy, RecordSourceSelectorProxy } from 'relay-runtime';

const mutation = graphql`
mutation AddTodoMutation($input: AddTodoInput!) {
	addTodo(input:$input) {
		todoEdge {
			__typename
			cursor
			node {
				complete
				id
				text
			}
		}
		viewer {
			id
			totalCount
		}
	}
}
`;

function sharedUpdater(store: RecordSourceSelectorProxy, user: UserInfo, newEdge: RecordProxy) {
	const userProxy = store.get(user.id);
	if (userProxy == null) {
		throw new Error('Could not get proxy for user with id: ' + user.id);
	}
	const conn = ConnectionHandler.getConnection(
		userProxy,
		'TodoList_todos',
	);
	if (conn == null) {
		throw new Error('Could not get connection for user proxy with id: ' + user.id);
	}
	ConnectionHandler.insertEdgeAfter(conn, newEdge);
}

let tempID = 0;

interface UserInfo {
	id: string;
}

function commit(
	environment: Environment,
	text: string,
	user: UserInfo,
) {
	return commitMutation<Relay.AddTodoMutation>(
		environment,
		{
			mutation,
			optimisticUpdater: (store) => {
				const id = 'client:newTodo:' + tempID++;
				const node = store.create(id, 'Todo');
				node.setValue(text, 'text');
				node.setValue(id, 'id');
				const newEdge = store.create(
					'client:newEdge:' + tempID++,
					'TodoEdge',
				);
				newEdge.setLinkedRecord(node, 'node');
				sharedUpdater(store, user, newEdge);
				const userProxy = store.get(user.id);
				if (userProxy == null) {
					throw new Error('Could not find user with id: ' + user.id);
				}
				userProxy.setValue(
					userProxy.getValue('totalCount') + 1,
					'totalCount',
				);
			},
			updater: (store) => {
				const payload = store.getRootField('addTodo');
				if (payload == null) {
					throw new Error('Could not find root field `addTodo` in response');
				}
				const newEdge = payload.getLinkedRecord('todoEdge');
				if (newEdge == null) {
					throw new Error('Could not find response property addTodo.todoEdge');
				}
				sharedUpdater(store, user, newEdge);
			},
			variables: {
				input: {
					clientMutationId: (tempID++).toString(),
					text,
				},
			},
		},
	);
}

export default { commit };