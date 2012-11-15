//あいう
// vim: set foldmethod=marker :

//
// pathsearcher.js のデモアプリ
//
// jQueryも使用しています
//

$(document).ready(function(){

// console.logとほぼ同じ
var consoleLog = PathSearcher._consoleLog;

// マス目生成
var EXTENT = [10, 10];
var SQUARE_SIZE = [32, 32];
var BORDER_WIDTH = 1;
var BOARD_SIZE = [
    SQUARE_SIZE[0] * EXTENT[0] + (EXTENT[0] + 1) * BORDER_WIDTH,
    SQUARE_SIZE[1] * EXTENT[1] + (EXTENT[1] + 1) * BORDER_WIDTH
];

// 盤設定
$('#board').css({
    position: 'relative',
    top: BORDER_WIDTH[0],
    left: BORDER_WIDTH[1],
    width: BOARD_SIZE[0],
    height: BOARD_SIZE[1],
    backgroundColor: '#CCC'
});

// マス目設定
var squares = [];
var ri, ci, sq;
for (ri = 0; ri < EXTENT[0]; ri++) {
    squares[ri] = [];
    for (ci = 0; ci < EXTENT[1]; ci++) {
        sq = $('<div />')
            .addClass('square')
            .addClass('row-' + ri)
            .addClass('column-' + ci)
            .css({
                position: 'absolute',
                top: SQUARE_SIZE[0] * ri + (ri + 1) * BORDER_WIDTH,
                left: SQUARE_SIZE[1] * ci + (ci + 1) * BORDER_WIDTH,
                width: SQUARE_SIZE[0],
                height: SQUARE_SIZE[1],
                lineHeight: SQUARE_SIZE[1] + 'px',
                textAlign: 'center',
                fontSize: 18,
                cursor: 'pointer'
            })
        ;
        $('#board').append(sq);
        sq._moveCost_ = false;
        sq._idx_ = [ri, ci];
        squares[ri][ci] = sq;
    };
};

// 選択中マス, [row,column] or null
var indexFrom = null;
var indexTo = null;

// 移動経路探索結果インスタンス
var searchResult = null;

// 初期化
var map = function(callback){
    var ri, ci;
    for (ri = 0; ri < squares.length; ri++) {
        for (ci = 0; ci < squares[0].length; ci++) {
            callback(squares[ri][ci]);
        };
    };
};
var draw = function(){
    map(function(sq){
        // 移動コスト
        var isKeepOut = (sq._moveCost_ === false);
        if (!isKeepOut) {
            sq.text(sq._moveCost_).css({backgroundColor:'#FFF'});
        } else {
            sq.text('#').css({backgroundColor:'#CCC'});
        };
        // 始点・終点
        if (indexFrom !== null && indexFrom[0] === sq._idx_[0] && indexFrom[1] === sq._idx_[1]) {
            sq.css({backgroundColor:'#FF9900'});
        } else if (indexTo !== null && indexTo[0] === sq._idx_[0] && indexTo[1] === sq._idx_[1]) {
            sq.css({backgroundColor:'#FF9900'});
        };
        // 経路
        if (searchResult !== null && searchResult.hasPath(indexTo)) {
            var steps = searchResult.getStepIndexes(indexTo);
            steps.pop();
            steps.shift();
            var i, ri, ci;
            for (i = 0; i < steps.length; i++) {
                ri = steps[i][0];
                ci = steps[i][1];
                squares[ri][ci].css({backgroundColor:'#FFFF33'});
            };
        };
    });
};
var searchPath = function(from, to){
    var ps = new PathSearcher();
    ps.load(squares, function(sq){
        if (sq._moveCost_ === false) return false;
        return sq._moveCost_;
    });
    ps.search(from, PathSearcher.INFINITY_MOVE_POWER, to);
    return ps.getResult();
};
var setClickHandlers = function(){// 全マスのクリックハンドラを設定
    map(function(sq){
        sq.bind('mousedown', {self:sq}, function(evt){
            var self = evt.data.self;
            if (self._moveCost_ === false) {
                indexFrom = null;
                indexTo = null;
                searchResult = null;
                draw();
                return false;
            };
            if (indexFrom === null) {
                indexFrom = sq._idx_;
                draw();
                return false;
            };
            if (indexTo === null) {
                indexTo = sq._idx_;
                searchResult = searchPath(indexFrom, indexTo);
                draw();
                return false;
            };
            indexFrom = indexTo;
            indexTo = sq._idx_;
            var result = searchPath(indexFrom, indexTo);
            if (result.hasPath(indexTo)) {
                searchResult = result;
            } else {
                indexFrom = null;
                indexTo = null;
                searchResult = null;
            };
            draw();
            return false;
        });
    });
};
var setMoveCosts = function(){// 全マスの移動コストを設定
    var list = [1, 1, 1, 1, 1, 3, 10, false, false];
    map(function(sq){
        var r = parseInt(Math.random() * list.length);
        sq._moveCost_ = list[r];
    });
};

setMoveCosts();
setClickHandlers();
draw();


});
