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
import { Environment } from 'relay-runtime';

const mutation = graphql`
  mutation RenameTodoMutation($input: RenameTodoInput!) {
    renameTodo(input:$input) {
      todo {
        id
        text
      }
    }
  }
`;

function getOptimisticResponse(text: string, todo: TodoInfo) {
	return {
		renameTodo: {
			todo: {
				id: todo.id,
				text: text,
			},
		},
	};
}

interface TodoInfo {
	id: string;
}

function commit(
	environment: Environment,
	text: string,
	todo: TodoInfo,
) {
	return commitMutation<Relay.RenameTodoMutation>(
		environment,
		{
			mutation,
			optimisticResponse: getOptimisticResponse(text, todo),
			variables: {
				input: { text, id: todo.id },
			},
		},
	);
}

export default { commit };
