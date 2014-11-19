/**
 * eTinyMCE integration library for Magento CMS.
 * 
 * @todo      Re-write to support multiple instances.
 *
 * @package   Rootd_Tinymce
 * @author    Rick Buczynski <me@rickbuczynski.com>
 * @copyright 2014 Rick Buczynski. All Rights Reserved.
 */

var RootdTinyMceExtension = Class.create();

RootdTinyMceExtension.prototype = {

    _key            : 0,
    _options        : {
        custom_css          : '',
        store_loader_url    : '',
        store_config        : [],
        store_loader_parent : '',
    },
    _storeLoader    : null,

    /**
     * Add a store CSS loader menu to the editor instance.
     *
     * @return RootdTinyMceExtension
     */
    addStoreLoader: function(editor) {
        var instance = this;

        if (!this._storeLoader && this.get('store_loader_parent')) {
            this._storeLoader = document.createElement('select');
            
            var stores = this.get('store_config');

            for (var i = 0; i < stores.length; i++) {
                var store       = stores[i],
                    option      = document.createElement('option');

                option.value    = store.id;
                option.text     = store.name;

                this._storeLoader.appendChild(option);
            }

            $(this._storeLoader).observe('change', function() {
                instance.loadStoreCss($F(this), editor);
            });

            $(this.get('store_loader_parent')).appendChild(this._storeLoader);
        }

        return this;
    },

    /**
     * Remove the specified CSS from the editor instance.
     * 
     * @param object editor The TinyMCE editor instance.
     * @param string uri    The URI of the asset to remove.
     * @param string tag    A ID tag by which to remove assets.
     * 
     * @return RootdTinyMceExtension
     */
    clearCss: function(editor, uri, tag) {
        var head    = editor.dom.getRoot().parentNode.getElementsByTagName('head')[0],
            css     = head.getElementsByTagName('link'),
            queue   = [],
            element = null;

        for (var i = 0; i < css.length; i++) {
            element = css[i];

            if (element.href == uri || element.href.indexOf(tag) > -1) {
                queue.push(element);
            }
        }

        while (queue.length) {
            head.removeChild(queue.pop());
        }

        return this;
    },

    /**
     * Remove all store-based CSS from the editor instance.
     * 
     * @param object editor The TinyMCE editor instance.
     * 
     * @return RootdTinyMceExtension
     */
    clearStoreCss: function(editor) {
        return this.clearCss(editor, null, 'enhanced_tinymce_store_css');
    },

    /**
     * Extend the TinyMCE setup.
     * 
     * @return RootdTinyMceExtension
     */
    extendSetup: function() {
        var instance = this;

        if (typeof tinyMceWysiwygSetup != 'undefined') {
            tinyMceWysiwygSetup.prototype.getDefaultSettings = tinyMceWysiwygSetup.prototype.getSettings;

            tinyMceWysiwygSetup.prototype.getSettings = function() {
                var settings = this.getDefaultSettings();

                // Preserve HTML source formatting
                settings.apply_source_formatting = false;
                settings.remove_linebreaks = false;

                // Re-write stock setup
                // Creates a bit of maintenance debt
                settings.setup = function(ed) {
                    ed.onSubmit.add(function(ed, e) {
                        varienGlobalEvents.fireEvent('tinymceSubmit', e);
                    });

                    ed.onPaste.add(function(ed, e, o) {
                        varienGlobalEvents.fireEvent('tinymcePaste', o);
                    });

                    ed.onBeforeSetContent.add(function(ed, o) {
                        varienGlobalEvents.fireEvent('tinymceBeforeSetContent', o);
                    });

                    ed.onSetContent.add(function(ed, o) {
                        varienGlobalEvents.fireEvent('tinymceSetContent', o);
                    });

                    ed.onSaveContent.add(function(ed, o) {
                        varienGlobalEvents.fireEvent('tinymceSaveContent', o);

                        instance.removeStoreLoader(ed);
                    });

                    ed.onChange.add(function(ed, l) {
                        varienGlobalEvents.fireEvent('tinymceChange', l);
                    });

                    ed.onExecCommand.add(function(ed, cmd, ui, val) {
                        varienGlobalEvents.fireEvent('tinymceExecCommand', cmd);
                    });

                    // Extended for this: to load CSS
                    ed.onPostRender.add(function(ed) {
                        if ( (css = instance.get('custom_css')) ) {
                            ed.dom.loadCSS(instance.tagCss(css));
                        }

                        instance.addStoreLoader(ed);
                    });
                }

                return settings;
            }
        }

        return this;
    },

    /**
     * Option getter.
     * 
     * @param string key The option key.
     * 
     * @return mixed
     */
    get: function(key) {
        if (typeof this._options[key] != 'undefined') {
            return this._options[key];
        }

        return null;
    },

    /**
     * Prepare the extension.
     * 
     * @param object options Initialization options.
     * 
     * @return void
     */
    initialize: function(options) {
        this._options = Object.extend(this._options, options || {});

        this.extendSetup();
    },

    /**
     * Load store-based CSS.
     * 
     * @param number storeId The desired store ID.
     * 
     * @return RootdTinyMceExtension
     */
    loadStoreCss: function(storeId, editor) {
        if (!storeId) {
            return this;
        }

        this.clearStoreCss(editor);

        var instance = this;

        if ( (url = this.get('store_loader_url')) ) {
            url = url.replace(/\{\{id\}\}/, storeId);

            new Ajax.Request(url, {
                onSuccess: function(transport) {
                    if (transport.responseText.isJSON()) {
                        var assets = transport.responseText.evalJSON();

                        for (var i = 0; i < assets.length; i++) {
                            editor.dom.loadCSS(instance.tagCss(assets[i], 'enhanced_tinymce_store_css'));
                        }
                    }
                }
            });
        }

        return this;
    },

    /**
     * Remove the store loader menu.
     *
     * @todo Implement
     * 
     * @return RootdTinyMceExtension
     */
    removeStoreLoader: function(editor) {
        $(this._storeLoader).remove();

        this._storeLoader = null;

        return this;
    },

    /**
     * Option setter.
     * 
     * @param string key   The option key.
     * @param mixed  value The option value.
     *
     * @return RootdTinyMceExtension
     */
    set: function(key, value) {
        this._options[key] = value;

        return this;
    },

    /**
     * Tag the CSS before loading for management.
     * 
     * @param string css The URL to the CSS.
     * 
     * @return string
     */
    tagCss: function(css, tag) {
        if (!tag) {
            tag = 'enhanced_tinymce';
        }

        if (css.indexOf('?') > 0) {
            tag = '&' + tag;
        } else {
            tag = '?' + tag;
        }

        tag += '&key=' + this._key.toString();

        this._key++;

        return css + tag;
    }

};