<?php

/**
 * eTinyMCE CodeMirror extension loader block.
 *
 * @package   Rootd_Tinymce
 * @author    Rick Buczynski <me@rickbuczynski.com>
 * @copyright 2014 Rick Buczynski. All Rights Reserved.
 */

class Rootd_Tinymce_Block_Loader
    extends Rootd_Tinymce_Block_Loader_Abstract
{

    /**
     * Configure base data.
     * 
     * @return void
     */
    protected function _construct()
    {
        $this->addData(
            array(
                'custom_css_url'        => $this->getConfigUrl('tinymce/general/custom_css'),
                'loader_js_url'         => $this->getConfigUrl('tinymce/general/loader_js'),
                'store_loader_parent'   => '',
            )
        );
    }

}