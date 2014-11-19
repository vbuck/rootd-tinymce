<?php

/**
 * eTinyMCE CodeMirror extension loader block.
 *
 * @package   Rootd_Tinymce
 * @author    Rick Buczynski <me@rickbuczynski.com>
 * @copyright 2014 Rick Buczynski. All Rights Reserved.
 */

class Rootd_Tinymce_Block_Loader_Codemirror
    extends Rootd_Tinymce_Block_Loader_Abstract
{

    protected $_plugins = array();

    /**
     * Configure base data.
     * 
     * @return void
     */
    protected function _construct()
    {
        $this->addData(
            array(
                'base_css_url'  => $this->getConfigUrl('tinymce/codemirror/base_css'),
                'base_js_url'   => $this->getConfigUrl('tinymce/codemirror/base_js'),
                'mode_js_url'   => $this->getConfigUrl('tinymce/codemirror/mode_js'),
                'loader_js_url' => $this->getConfigUrl('tinymce/codemirror/loader_js'),
            )
        );

        $this->_initPlugins();
    }

    /**
     * Add configured plugins.
     * 
     * @return Rootd_Tinymce_Block_Loader_Codemirror
     */
    protected function _initPlugins()
    {
        $plugins = explode(',', Mage::getStoreConfig('tinymce/codemirror/plugins'));

        foreach ($plugins as $plugin) {
            $this->addPlugin($plugin);
        }

        return $this;
    }

    /**
     * Add a CodeMirror plugin.
     * 
     * @param string $path An absolute or relative path to the plugin.
     *
     * @return Rootd_Tinymce_Block_Loader_Codemirror
     */
    public function addPlugin($path)
    {
        $this->_plugins[] = $this->resolveUrl($path);

        return $this;
    }

    /**
     * Generate JavaScript HTML for all registered plugins.
     * 
     * @return string
     */
    public function getPluginJsHtml()
    {
        $html = '';

        foreach ($this->_plugins as $plugin) {
            $html .= $this->getJsHtml($plugin) . "\n";
        }

        return $html;
    }

}