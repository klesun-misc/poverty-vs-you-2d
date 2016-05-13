
// require.js ordered me to put the inline javascript code here

var wanted = [
    './src/MokonaGame.js',
    './libs/easeljs-0.8.2.combined.js',
    'https://ajax.googleapis.com/ajax/libs/jquery/2.2.3/jquery.min.js'
];

requirejs(wanted, (MokonaGame) =>
    MokonaGame.MokonaGame(
        document.getElementById('demoCanvas'),
        document.getElementById('editorPalette')
    ).start());

