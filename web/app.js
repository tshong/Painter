var canvas = new fabric.Canvas('canvas');
canvas.isDrawingMode = true;
canvas.freeDrawingBrush.width = 10;
canvas.freeDrawingBrush.color = '#000000';

var app = new Vue({
  el: '#app',
  data: {
    selectedTool: '',
    undoStack: [],
    redoStack: []
  },
  computed: {
    canUndo: function() {
      return this.undoStack.length > 0;
    },
    canRedo: function() {
      return this.redoStack.length > 0;
    }
  },
  methods: {
    clearCanvas: function() {
      canvas.clear();
    },
    undo: function() {
      if (this.canUndo) {
        var last = this.undoStack.pop();
        this.redoStack.push(last);
        canvas.loadFromJSON(last);
      }
    },
    redo: function() {
      if (this.canRedo) {
        var last = this.redoStack.pop();
        this.undoStack.push(last);
        canvas.loadFromJSON(last);
      }
    }
  },
  watch: {
    selectedTool: function(val) {
        console.log('tool selected:'+val)
      switch (val) {
        case 'line':
          // canvas.isDrawingMode = false;
          canvas.off('mouse:down');
          canvas.off('mouse:move');
          canvas.off('mouse:up');
          canvas.off('object:selected');
          var line;
          canvas.on('mouse:down', function(o) {
            console.log('mouse.down !')
            var pointer = canvas.getPointer(o.e);
            var points = [ pointer.x, pointer.y, pointer.x+100, pointer.y+100 ];
            line = new fabric.Line(points, {
              strokeWidth: 5,
              stroke: 'green',
              fill: 'green',
              originX: 'center',
              originY: 'center'
            });
            canvas.add(line);
              console.log('line added:', line)
          });
          canvas.on('mouse:move', function(o) {
            if (!line) return;
            var pointer = canvas.getPointer(o.e);
            line.set({ x2: pointer.x, y2: pointer.y });
            canvas.renderAll();
          });
          canvas.on('mouse:up', function(o) {
            line.setCoords();
            canvas.renderAll();
            var json = JSON.stringify(canvas);
            app.undoStack.push(json);
          });
          break;
        case 'text':
          canvas.isDrawingMode = false;
          canvas.off('mouse:down');
          canvas.off('mouse:move');
          canvas.off('mouse:up');
          canvas.off('object:selected');
          var text;
          canvas.on('mouse:down', function(o) {
            var pointer = canvas.getPointer(o.e);
            text = new fabric.IText('Enter text here', {
              left: pointer.x,
              top: pointer.y,
              fontFamily: 'Arial',
              fontSize: 20,
              fill: '#000000',
              originX: 'left',
              originY: 'top'
            });
            canvas.add(text);
            text.enterEditing();
          });
          canvas.on('text:editing:exited', function(o) {
            var json = JSON.stringify(canvas);
            app.undoStack.push(json);
          });
          break;
        case 'image':
          canvas.isDrawingMode = false;
          canvas.off('mouse:down');
          canvas.off('mouse:move');
          canvas.off('mouse:up');
          canvas.off('object:selected');
          var image;
          canvas.on('mouse:down', function(o) {
            var pointer = canvas.getPointer(o.e);
            fabric.Image.fromURL('https://picsum.photos/200/300', function(img) {
              image = img.set({ left: pointer.x, top: pointer.y });
              canvas.add(image);
            });
          });
          canvas.on('object:selected', function(o) {
            var json = JSON.stringify(canvas);
            app.undoStack.push(json);
          });
          break;
        default:
          canvas.isDrawingMode = true;
          canvas.freeDrawingBrush.width = 10;
          canvas.freeDrawingBrush.color = '#000000';
          canvas.off('mouse:down');
          canvas.off('mouse:move');
          canvas.off('mouse:up');
          canvas.off('object:selected');
          break;
      }
    }
  }
});