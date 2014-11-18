<?php

/**
 * eTinyMCE abstract loader block.
 *
 * @package   Rootd_Tinymce
 * @author    Rick Buczynski <me@rickbuczynski.com>
 * @copyright 2014 Rick Buczynski. All Rights Reserved.
 */

class Rootd_Tinymce_Block_Loader_Abstract
    extends Mage_Core_Block_Template
{

    /**
     * Get a URL from store configuration value.
     * 
     * @param string $configPath The store configuration path.
     * 
     * @return string
     */
    public function getConfigUrl($configPath = '')
    {
        return $this->getUrl(Mage::getStoreConfig($configPath));
    }

    /**
     * Generate stylesheet HTML for the given URL.
     * 
     * @param string $url The URL to the resource.
     * 
     * @return string
     */
    public function getCssHtml($url)
    {
        return '<link rel="stylesheet" href="' . $this->htmlEscape($url) . '" />';
    }

    /**
     * Generate JavaScript HTML for the given URL.
     * 
     * @param string $url The URL to the resource.
     * 
     * @return string
     */
    public function getJsHtml($url)
    {
        return '<script type="text/javascript" src="' . $this->htmlEscape($url) . '"></script>';
    }

    /**
     * Resolve a URL from the given path.
     * 
     * @param string $path The input path.
     * 
     * @return string
     */
    public function getUrl($path)
    {
        if (!$path) {
            return '';
        }

        if ( preg_match('~^(http(s)?:|//)~', $path) ) {
            return $path;
        }

        return Mage::helper('core/js')->getJsUrl($path);
    }

}