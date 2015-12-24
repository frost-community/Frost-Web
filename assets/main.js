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
	$('.login-section form').submit(function (e) {
		e.preventDefault();
		$.post('./login', $('.login-section form').serialize(), function () {
			window.showMessage('ログインリクエストに成功しました');
			//location.reload();
		}).fail(function () {
			window.showMessage('ログインリクエストに失敗しました');
		});
	});
});
