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
import { ConnectionHandler, Environment, RecordSourceSelectorProxy } from 'relay-runtime';

const mutation = graphql`
  mutation RemoveTodoMutation($input: RemoveTodoInput!) {
    removeTodo(input: $input) {
      deletedTodoId,
      viewer {
        completedCount,
        totalCount,
      },
    }
  }
`;

function sharedUpdater(store: RecordSourceSelectorProxy, user: UserInfo, deletedID: string) {
	const userProxy = store.get(user.id);
	if (userProxy == null) {
		throw new Error('Could not find user with id: ' + user.id);
	}
	const conn = ConnectionHandler.getConnection(
		userProxy,
		'TodoList_todos',
	);
	if (conn == null) {
		throw new Error('Could not find connection TodoList_todos for user ' + user.id);
	}
	ConnectionHandler.deleteNode(
		conn,
		deletedID,
	);
}

interface UserInfo {
	id: string;
}

interface TodoInfo {
	id: string;
}

function commit(
	environment: Environment,
	todo: TodoInfo,
	user: UserInfo,
) {
	return commitMutation<Relay.RemoveTodoMutation>(
		environment,
		{
			mutation,
			optimisticUpdater: (store) => {
				sharedUpdater(store, user, todo.id);
			},
			updater: (store) => {
				const payload = store.getRootField('removeTodo');
				if (payload == null) {
					throw new Error('Could not find root field: removeTodo');
				}
				sharedUpdater(store, user, payload.getValue('deletedTodoId'));
			},
			variables: {
				input: { id: todo.id },
			},
		},
	);
}

export default { commit };
