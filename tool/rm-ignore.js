var fs = require( 'fs' );


var inputFile;
var outputFile;

for ( var i = 2; i < process.argv.length; i++ ) {
    switch ( process.argv[ i ] ) {
        case '-o':
            i++;
            outputFile = process.argv[ i ];
            break;
        case '-i':
            i++;
            inputFile = process.argv[ i ];
            break;
    }
}

var fileContent = fs.readFileSync( inputFile, 'utf8' );
var lines = fileContent.split( /\r?\n/ );
var ignoreState = 0;
for ( var i = 0, len = lines.length; i < len; i++ ) {
    var line = lines[ i ];
    if ( ignoreState ) {
        if ( /\/\/\s*#end-ignore/.test( line ) ) {
            ignoreState = 0;
        }
        else {
            lines[ i ] = '//' + line;
        }
    }
    else if ( /\/\/\s*#begin-ignore/.test( line ) ) {
        ignoreState = 1;
    }
}

fs.writeFileSync( outputFile, lines.join( '\n' ), 'utf8' );
