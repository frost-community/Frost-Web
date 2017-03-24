var $ = jQuery;

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
};

$(function () {
	$('form').submit(function (e) {
		e.preventDefault();
	});

	$('.post-create-button').click(function () {
		window.showMessage('ポストの投稿はまだ実装されていません。今しばらくお待ちください。');
	});

	$('.signin-button').click(function () {
		$.post('./signin', $('.signin-section form').serialize(), function () {
			location.reload();
		}).fail(function () {
			window.showMessage('ログインリクエストに失敗しました');
		});
	});

	$('.signout-button').click(function () {
		$.post('./signout', [], function () {
			location.reload();
		}).fail(function () {
			window.showMessage('ログアウトリクエストに失敗しました');
		});
	});

	$('.signup-button').click(function () {
		$.post('./api/account/create', $('.signin-section form').serialize(), function () {
			location.reload();
		}).fail(function (xhr) {
			var res = JSON.parse(xhr.responseText);
			window.showMessage('アカウント作成に失敗しました。('+res.error.message+')');
		});
	});
});
