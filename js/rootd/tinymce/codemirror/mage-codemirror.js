/**
 * CodeMirror integration library for TinyMCE.
 *
 * @package   Rootd_Tinymce
 * @author    Rick Buczynski <me@rickbuczynski.com>
 * @copyright 2014 Rick Buczynski. All Rights Reserved.
 */

(function() {

    // Scoped variables
    var codeMirrorEditorInstance    = null;
    var origContentTextArea         = null;
    var tinyMceTrigger              = null;

    /**
     * Initialize a CodeMirror instance.
     * 
     * @return void
     */
    var initCodeMirrorInstance = function() {
        if (codeMirrorEditorInstance) {
            destroyCodeMirrorInstance();
        }

        // Must not modify original textarea, so we clone
        var cloneTextArea           = document.createElement('textarea');

        // Attempt to copy attributes from original
        cloneTextArea.id            = origContentTextArea.id + '_clone';
        cloneTextArea.className     = 'textarea';
        cloneTextArea.style.cssText = origContentTextArea.style.cssText;
        cloneTextArea.rows          = origContentTextArea.rows;
        cloneTextArea.cols          = origContentTextArea.cols;
        cloneTextArea.style.display = 'none';

        // Insert after original
        Element.insert(origContentTextArea, { before: cloneTextArea });

        // "Hide" original
        origContentTextArea.style.position  = 'fixed';
        origContentTextArea.style.left      = '-10000px';
        origContentTextArea.style.top       = '-10000px';

        // Manage a custom visibility state on original
        origContentTextArea.writeAttribute('data-state', 'code');

        // Initialize from clone
        codeMirrorEditorInstance = CodeMirror.fromTextArea(cloneTextArea, { lineNumbers : true });
        
        // Copy contents from original
        codeMirrorEditorInstance.setValue(origContentTextArea.value);

        // Persist changes to clone from instance
        codeMirrorEditorInstance.on('change', function() {
            codeMirrorEditorInstance.save();
            origContentTextArea.value = codeMirrorEditorInstance.getValue();
        });

        // Auto-formatting code
        // @todo not working
        /*CodeMirror.commands.selectAll(codeMirrorEditorInstance);

        codeMirrorEditorInstance.autoFormatRange(
            codeMirrorEditorInstance.getCursor(true), 
            codeMirrorEditorInstance.getCursor(false)
        );

        CodeMirror.commands.undoSelection(codeMirrorEditorInstance);*/
    };

    /**
     * Remove the current CodeMirror instance.
     * 
     * @return void
     */
    var destroyCodeMirrorInstance = function() {
        if (codeMirrorEditorInstance) {
            // Get attached textarea (clone from initialization)
            var cloneTextArea = codeMirrorEditorInstance.getTextArea();

            // Write contents to original
            origContentTextArea.value = codeMirrorEditorInstance.getValue();

            // "Show" original
            origContentTextArea.writeAttribute('data-state', false);
            origContentTextArea.style.position  = 'relative';
            origContentTextArea.style.left      = '0';
            origContentTextArea.style.top       = '0';

            // Remove instance
            $(codeMirrorEditorInstance.getWrapperElement()).remove();
            $(cloneTextArea).remove();

            codeMirrorEditorInstance = null;
        }
    }

    /**
     * CodeMirror visibility state manager.
     * 
     * @return void
     */
    var toggleCodeMirrorInstance = function() {
        if (
            origContentTextArea.readAttribute('data-state') != 'code' &&
            !$(origContentTextArea.id + '_parent')
        ) 
        {
            initCodeMirrorInstance();
        } else {
            destroyCodeMirrorInstance();
        }
    };

    /**
     * Observe Varien tinyMCE change events. Enables core Magento
     * plugins to route content to CodeMirror instance.
     *
     * @requires Magento 1.4.x+
     * @see      Mediabrowser.prototype.insert (js/mage/adminhtml/browser.js)
     * @see      WysiwygWidget.Widget.prototype.updateContent (js/mage/adminhtml/wysiwyg/widget.js)
     * 
     * @return void
     */
    varienGlobalEvents.attachEventHandler('tinymceChange', function() {
        if (codeMirrorEditorInstance) {
            codeMirrorEditorInstance.setValue(origContentTextArea.value);
        }
    });

    /**
     * Extend variable plugin to trigger the Varien tinyMCE change event.
     *
     * @requires Magento 1.4.x+
     * 
     * @type void
     */
    MagentovariablePlugin.origInsertVariable = MagentovariablePlugin.insertVariable;
    MagentovariablePlugin.insertVariable = function (value) {
        if (this.textareaId) {
            Variables.init(this.textareaId);
            Variables.insertVariable(value);

            varienGlobalEvents.fireEvent('tinymceChange');
        } else {
            Variables.closeDialogWindow();

            this.editor.execCommand('mceInsertContent', false, value);
        }
    };

    /**
     * Refresh CodeMirror instance on admin tab change.
     * Fixes a display bug with CodeMirror state.
     * 
     * @return void
     */
    varienGlobalEvents.attachEventHandler('showTab', function() {
        if (codeMirrorEditorInstance) {
            codeMirrorEditorInstance.refresh();
        }
    });

    // Expose bootstrapper function
    attachCodeMirrorTo = function(target, trigger) {
        origContentTextArea = $(target);
        tinyMceTrigger      = $(trigger);

        /**
         * Bind CodeMirror to tinyMCE toggle control.
         *
         * @requires Magento 1.4.x+
         *
         * @return void
         */
        if (tinyMceTrigger) {
            tinyMceTrigger.observe('click', function() {
                toggleCodeMirrorInstance();
            });
        }

        initCodeMirrorInstance();
    };

}());