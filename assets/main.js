window.showMessage = function (message) {
	var item = $('<div class="message-item">').text(message);
	$('.message-container').prepend(item);
	item.css({
		opacity: 1,
		transition: 'opacity .5s ease'
	});
	setTimeout(function () {
		item.css({
			opacity: 0
		});
		setTimeout(function () {
			item.remove();
		}, 500);
	}, 5000);
}

$(function () {
	$('.signin-section form').submit(function (e) {
		e.preventDefault();
	});
	
	$('.signin-button').click(function () {
		$.post('./signin', $('.signin-section form').serialize(), function () {
			location.reload();
		}).fail(function () {
			window.showMessage('ログインリクエストに失敗しました');
		});
	});
	
	$('.signup-button').click(function () {
		$.post('./api/account/create', $('signin-section form').serialize(), function () {
			location.reload();
		}).fail(function (xhr) {
			var res = JSON.parse(xhr.responseText);
			switch (res.error.code) {
				case 2:
					window.showMessage('アカウント作成に失敗しました。入力されたパラメータは無効です。');
					break;
				default:
					window.showMessage('アカウント作成に失敗しました。');
					break;
			}
			
		});
	});
});
