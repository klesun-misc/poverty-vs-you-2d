
// require.js ordered me to put the inline javascript code here

var wanted = [
    './src/MokonaGame.js',
    './libs/easeljs-0.8.2.combined.js',
];

requirejs(wanted, (MokonaGame) =>
    MokonaGame.MokonaGame(document.getElementById('demoCanvas')).start());

