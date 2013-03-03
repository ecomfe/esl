var go = require,
	config = require.config,
	implemented = {
		basic: true,
		anon: true,
		require: true,
		funcString: true,
		namedWrapped: true,
		plugins: true,
		pluginDynamic: false
	};

require = undefined;