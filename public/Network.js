;(function() {
	
	function filterInvalidMsg(errMsg) {
		// 发送Ajax请求后可能会出现5XX等错误，这时需要把错误信息输出以便调试，但后端返回的错误信息一般都会包含非常多无效信息，所以需要过滤
		// 1.过滤head标签无效内容 <!DOCTYPE html><html><head>[\s\S]+<body>
		// 2.过滤body、html结束符 <\/body><\/html>
		// 3.过滤标签头 <[a-zA-Z0-9]+>
		// 4.过滤标签尾 <\/[a-zA-Z0-9]+>
		// 5.过滤无意义内容 type Status report
		// 6.过滤带有样式的标签 <[a-zA-Z0-9 ="]+>
		// 7.过滤服务器信息 Apache Tomcat\/[0-9.]+
		// 8.过滤无效信息  - message description 
		
		return errMsg.replace(/<!DOCTYPE html><html><head>[\s\S]+<body>/, '')
					.replace('<\/body><\/html>', '')
					.replace(/<[a-zA-Z0-9]+>/gi, '')
					.replace(/<\/[a-zA-Z0-9]+>/gi, '')
					.replace('type Status report', '')
					.replace(/<[a-zA-Z0-9 ="]+>/gi, '')
					.replace(/Apache Tomcat\/[0-9.]+/, '')
					.replace(' - message description ', '.');
	}
	
	function get(path, succCB, errCB) {
		window.ajax().get(path).then(function(response, xhr) {
			if (typeof succCB === "function") {
				succCB(response, xhr);
			}
		}).catch(function(response, xhr) {
			if (typeof errCB === "function") {
				var errMsg = filterInvalidMsg(response);
				errCB(response, xhr, errMsg);
			}
		});
	}
	
	function post(path, data, succCB, errCB) {
		window.ajax().post(path, data).then(function(response, xhr) {
			if (typeof succCB === "function") {
				succCB(response, xhr);
			}
		}).catch(function(response, xhr) {
			if (typeof errCB === "function") {
				var errMsg = filterInvalidMsg(response);
				errCB(response, xhr, errMsg);
			}
		});
	}
	
	if (!window.Network) {
		window.Network = {};
	}
	
	window.Network.ajax = {
		"get": get,
		"post": post
	}
})();
