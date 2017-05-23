import riot from 'riot';

// components
import '../tags/frost-login-form.tag';
import '../tags/frost-signup-form.tag';
import '../tags/frost-logout-button.tag';
import '../tags/frost-create-status-form.tag';
import '../tags/frost-public-timeline.tag';
import '../tags/frost-applications.tag';
import '../tags/frost-create-application-form.tag';

const socket = io(); /* headのscriptタグからsocket.ioを読み込んで使用している(妥協) */
const obs = riot.observable();

const mountOption = {obs: obs, socket: socket};

let userId;
const elements = document.getElementsByName('frost-userId');
if(elements.length != 0) {
	userId = elements.item(0).content;
}

socket.on('ready', (readyData) => {
	if (userId != null) {
		mountOption.userId = userId;
		socket.emit('rest', {request: {
			method: 'get', endpoint: `/users/${userId}`,
			headers: {'x-api-version': 1.0},
		}});

		const handler = (restData) => {
			if (restData.request.endpoint == `/users/${userId}`) {
				socket.removeListener('rest', handler);
				if (restData.success) {
					mountOption.user = restData.response.user;
					console.log('set user data.');
				}
				else {
					console.log('faild to fetch user data.');
				}
			}
		};
		socket.on('rest', handler);
	}
});

riot.mount('*', mountOption);
