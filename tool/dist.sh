#! /bin/sh

basedir=$(dirname $0)

cd "$basedir/.."

rm -rf dist
mkdir dist


mkdir dist/src
cp src/esl.js dist/src/esl.source.js
# node tool/rm-ignore.js -i dist/src/esl.source.js -o dist/src/esl.source.min.js
cd dist/src
uglifyjs esl.source.js -m -c --source-map=esl.map --source-map-include-sources --source-map-url=esl.map -o esl.js
cd ../../
# uglifyjs dist/src/esl.source.min.js -m -c -o dist/src/esl.min.js
uglifyjs src/js.js -m -c -o dist/src/js.js
uglifyjs src/css.js -m -c -o dist/src/css.js

gzip -kf dist/src/esl.js
# gzip -kf dist/src/esl.min.js


cp -r test dist/test
# cp -r test dist/test-min

rm dist/test/impl/esl/esl.js
cp dist/src/esl.js dist/test/impl/esl/esl.js

# rm dist/test-min/impl/esl/esl.js
# cp dist/src/esl.min.js dist/test-min/impl/esl/esl.js
