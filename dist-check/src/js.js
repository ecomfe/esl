define("js",{load:function(e,a,t){function n(){var e=d.readyState;(void 0===e||/^(loaded|complete)$/.test(e))&&(d.onload=d.onreadystatechange=null,d=null,t(!0))}var d=document.createElement("script");d.src=a.toUrl(e),d.async=!0,d.readyState?d.onreadystatechange=n:d.onload=n;var o=document.getElementsByTagName("head")[0]||document.body;o.appendChild(d),o=null}});