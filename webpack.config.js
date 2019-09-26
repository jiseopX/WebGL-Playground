const path = require('path');

module.exports = {
  entry: './script.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.(glsl|vs|fs|vert|frag)$/,
        exclude: /node_modules/,
        use: ['raw-loader',
          'glslify-loader',
        ],
      }
    ]
  }

};
