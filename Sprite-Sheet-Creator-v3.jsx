/*
The MIT License (MIT)

See: https://github.com/AndresCuervo/photoshop-spritesheet-creator/blob/master/LICENSE
*/


/*
<javascriptresource>
    <name>Create Sprite Sheet from Layers v3</name>
</javascriptresource>
*/

/* Repository link: */

// Duplicate current Document
app.activeDocument.duplicate();

function boundsEmpty(bounds) {
    var x1 = bounds[0];
    var y1 = bounds[1];
    var x2 = bounds[2];
    var y2 = bounds[3];
    var boundsDistance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    return boundsDistance === 0;
}

var i, prefRulerUnits, prefTypeUnits, frames, frameWidth, frameHeight, mp, dialog, columns, rows,

    exit = function () {

        dialog.close();
    },

    onRowsChanged = function () {
        // TODO: Add a box that tells you how many sprites per row there will be!!! So you can preview if it's easily divisble :)
        rows = Number(dialog.msgPnl.rowsGrp.rows.text);
        columns = Math.ceil(frames / rows);
        dialog.msgPnl.columns.text = 'Columns: ' + columns;
    },

    createSprite = function () {

        var i, columnIndex, rowIndex;

        dialog.hide();

        app.activeDocument.resizeCanvas(columns * frameWidth, rows * frameHeight, AnchorPosition.TOPLEFT);

        columnIndex = 0;
        rowIndex = 0;
        for (i = 0; i < frames; i += 1) {
            var layer = activeDocument.layers[i];

            if (layer.visible) {
                if (!boundsEmpty(layer.bounds)) {
                    if (dialog.msgPnl.topDownCheckbox.value) {
                        layer.translate(frameWidth * columnIndex, frameHeight * rowIndex);
                    } else {
                        layer.translate((frames - 1) * frameWidth - frameWidth * columnIndex, frameHeight * rowIndex);
                    }
                }
                columnIndex += 1;
                if (columnIndex >= columns) {
                    rowIndex += 1;
                    columnIndex = 0;
                }
            }
        }

        app.activeDocument.mergeVisibleLayers();
        app.activeDocument.layers[0].name = "Sprite Sheet with " + frames + " Frames";
    };

if (app && app.preferences) {
    // Save the current preferences
    prefRulerUnits = app.preferences.rulerUnits,
        prefTypeUnits = app.preferences.typeUnits,
        // Change the current preferences to pixel units
        app.preferences.typeUnits = TypeUnits.PIXELS;
    app.preferences.rulerUnits = Units.PIXELS;
}

try {
    if (app && app.activeDocument) {

        // Determine number of visible layers
        frames = 0;
        for (i = 0; i < app.activeDocument.layers.length; i += 1) {
            if (app.activeDocument.layers[i].visible) {
                frames += 1;
            }
        }

        if (frames <= 1) {
            alert("Error: Sprite sheet requires more than one visible layer");
        } else {

            // Create dialog
            dialog = new Window('dialog', 'Sprite Sheet Creator v2');

            dialog.msgPnl = dialog.add('panel', undefined, undefined);

            dialog.msgPnl.frames = dialog.msgPnl.add('StaticText', undefined, 'Number of Frames:');
            dialog.msgPnl.frames.alignment = 'left';
            dialog.msgPnl.frames.text = "Frames: " + frames;

            columns = frames;
            dialog.msgPnl.columns = dialog.msgPnl.add('StaticText', undefined, 'Columns: ' + columns);
            dialog.msgPnl.columns.alignment = 'left';

            dialog.msgPnl.rowsGrp = dialog.msgPnl.add('group', undefined, undefined, {
                orientation: 'column',
                alignChildren: 'left'
            });
            dialog.msgPnl.rowsGrp.alignment = 'left';

            dialog.msgPnl.rowsGrp.rowsLabel = dialog.msgPnl.rowsGrp.add('StaticText', undefined, 'Rows: ');

            rows = 1;
            dialog.msgPnl.rowsGrp.rows = dialog.msgPnl.rowsGrp.add('EditText', undefined, rows);
            dialog.msgPnl.rowsGrp.rows.characters = 3;
            dialog.msgPnl.rowsGrp.rows.enabled = false;
            dialog.msgPnl.rowsGrp.rows.addEventListener('changing', onRowsChanged);

            dialog.msgPnl.topDownCheckbox = dialog.msgPnl.add('checkbox', undefined, 'First Frame is Top Layer');
            dialog.msgPnl.topDownCheckbox.value = true;
            dialog.msgPnl.topDownCheckbox.enabled = false;

            dialog.message = dialog.add('StaticText', undefined, 'Initializing...', {
                multiline: true
            });
            dialog.message.text = "";

            dialog.btnGrp = dialog.add('group');
            dialog.btnGrp.cancelButton = dialog.btnGrp.add('button', undefined, 'Cancel');
            dialog.btnGrp.cancelButton.onClick = exit;
            dialog.btnGrp.cancelButton.alignment = ['left', 'bottom'];

            dialog.btnGrp.createButton = dialog.btnGrp.add('button', undefined, 'Ok');
            dialog.btnGrp.createButton.onClick = createSprite;
            dialog.btnGrp.cancelButton.alignment = ['right', 'bottom'];
            dialog.btnGrp.createButton.enabled = false;

            // Determine the frame width based on the active document's dimensions
            frameWidth = app.activeDocument.width;
            frameHeight = app.activeDocument.height;

            // Determine the MP to see if the image is too large to load on iOS devices
            mp = frameHeight * frameWidth / 1024 / 1024;

            if (mp * frames > 5) {
                dialog.message.text = "Warning: The sprite sheet is too large to be loaded on iOS devices (see http://wmalone.com/maximage for details)";
            } else if (mp * frames > 3) {
                dialog.message.text = "Warning: The sprite sheet is too large to be loaded on legacy iOS devices (see http://wmalone.com/maximage for details)";
            } else {
                //dialog.msgPnl.message.text = "Ready to create sprite sheet...";
            }
            dialog.btnGrp.createButton.enabled = true;
            dialog.msgPnl.topDownCheckbox.enabled = true;
            dialog.msgPnl.rowsGrp.rows.enabled = true;

            dialog.show();
        }

    } else {
        alert("Error: No document open");
    }
} catch (ex) {
    alert("Error: No document open");
}

if (app && app.preferences) {
    // Revert to the previous preferences
    app.preferences.typeUnits = prefTypeUnits;
    app.preferences.rulerUnits = prefRulerUnits;
}
