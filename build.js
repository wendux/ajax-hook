/**
 * Created by du on 16/9/24.
 */
let path = require('path');
let webpack = require('webpack');
let env = process.argv[2] || "dev"
console.log(env)
let entry = {
    "ajaxhook": "./index.js",
}

let plugins = [];

var output={
    path: path.resolve("./dist/")

}

 if (env === "test") {
    entry = {
        "es": "./test/es.js",
        'hook': './test/hook.js',
        'proxy': './test/proxy.js'
    }
    output = {
        path: path.resolve("./test/dist"),
        filename: "[name].js"
    }
} else if (env === "cdn") {
    entry = {
        "ajaxhook": "./src/cdn.js",
        "ajaxhook.core": "./src/cdn-core.js",
    }
    output.filename = "[name].js"
    output.libraryTarget = 'window'
} else if (env === "cdn-min") {
    entry = {
        "ajaxhook": "./src/cdn.js",
        "ajaxhook.core": "./src/cdn-core.js",
        // "ajaxhook": "./src/xhr-proxy.js",
        // "ajaxhook.core": "./src/xhr-hook.js",
    }
    output.filename = "[name].min.js"
    output.libraryTarget = 'window'
    plugins.push(new webpack.optimize.UglifyJsPlugin({
        // compress: {
        //     warnings: true
        // },
        sourceMap: true
    }))
}
else if (env === "umd") {
    output.libraryTarget = "umd"
    output.filename = "[name].umd.js"
}else if (env === "umd-min") {
    output.libraryTarget = "umd"
    output.filename = "[name].umd.min.js"
    plugins.push(new webpack.optimize.UglifyJsPlugin({
        // compress: {
        //     warnings: true
        // },
        sourceMap: true
    }))
}


let config = {
    devtool: env.endsWith('min')?'source-map':'none',
    entry: entry,
    output: output,
    module: {
        rules: [
            {
                test: /\.js$/,
                include: [path.resolve('./src'), path.resolve('./test'), path.resolve('./index.js')],
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            presets: ['es2015']
                        }
                    },
                ]
            }
        ]
    },
    plugins: plugins
}


webpack(config, function (err, stats) {
    if (err) throw err;
    process.stdout.write(stats.toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false
    }) + '\n')
});



