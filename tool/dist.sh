#! /bin/sh

basedir=$(dirname $0)

cd "$basedir/.."

rm -rf dist
mkdir dist
rm -rf dist-check
mkdir dist-check


mkdir dist-check/src
cp src/esl.js dist-check/src/esl.source.js
# node tool/rm-ignore.js -i dist-check/src/esl.source.js -o dist-check/src/esl.source.min.js
cd dist-check/src
npx uglifyjs esl.source.js -m -c --source-map=esl.map --source-map-include-sources --source-map-url=esl.map -o esl.js
cd ../../
# uglifyjs dist-check/src/esl.source.min.js -m -c -o dist-check/src/esl.min.js
npx uglifyjs src/js.js -m -c -o dist-check/src/js.js
npx uglifyjs src/css.js -m -c -o dist-check/src/css.js

gzip -kf dist-check/src/esl.js
# gzip -kf dist-check/src/esl.min.js


cp -r test dist-check/test
# cp -r test dist-check/test-min

rm dist-check/test/impl/esl/esl.js
cp dist-check/src/esl.js dist-check/test/impl/esl/esl.js

# rm dist-check/test-min/impl/esl/esl.js
# cp dist-check/src/esl.min.js dist-check/test-min/impl/esl/esl.js

cp dist-check/src/*.js dist
