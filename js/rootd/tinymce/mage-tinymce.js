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
    addStoreLoader: function() {
        /* @todo Finish store loader implementation */
        return this;

        var instance = this;

        if (!this._storeLoader && this.get('store_loader_parent')) {
            this._storeLoader = document.createElement('select');
            
            var stores = this.get('store_config');

            for (var id in stores) {
                var option      = document.createElement('option');
                option.value    = id;
                option.text     = stores[id];

                this._storeLoader.appendChild(option);
            }

            $(this._storeLoader).observe('change', function() {
                instance.loadStoreCss($F(this));
            });

            $(this.get('store_loader_parent')).appendChild(this._storeLoader);
        }

        return this;
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

                        instance.removeStoreLoader();
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

                        instance.addStoreLoader();
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
        this.addStoreLoader();
    },

    /**
     * Load store-based CSS.
     *
     * @todo Implement
     * 
     * @param number storeId The desired store ID.
     * 
     * @return RootdTinyMceExtension
     */
    loadStoreCss: function(storeId) {
        if ( (url = this.get('store_loader_url')) ) {
            url += 'id/' + storeId;
        }
    },

    /**
     * Remove the store loader menu.
     *
     * @todo Implement
     * 
     * @return RootdTinyMceExtension
     */
    removeStoreLoader: function() {
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
    tagCss: function(css) {
        var tag = 'enhanced_tinymce';

        if (css.indexOf('?') > 0) {
            tag = '&' + tag;
        } else {
            tag = '?' + tag;
        }

        return css + tag;
    }

};