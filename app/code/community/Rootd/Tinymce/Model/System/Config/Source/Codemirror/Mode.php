<?php

/**
 * eTinyMCE CodeMirror plugin mode source model.
 *
 * @package   Rootd_Tinymce
 * @author    Rick Buczynski <me@rickbuczynski.com>
 * @copyright 2014 Rick Buczynski. All Rights Reserved.
 */

class Rootd_Tinymce_Model_System_Config_Source_Codemirror_Mode
{

    private $_modes = array();
    private $_path  = 'rootd/tinymce/codemirror/mode';

    /**
     * Load the available syntax modes from storage.
     * 
     * @return Rootd_Tinymce_Model_System_Config_Source_Codemirror_Mode
     */
    protected function _loadModes()
    {
        if (empty($this->_modes)) {
            $this->_modes   = array();
            $path           = Mage::getBaseDir() . str_replace('/', DS, "/js/{$this->_path}");
            
            if (is_dir($path)) {
                $dh = opendir($path);

                while ( false !== ($file = readdir($dh)) ) {
                    if (!preg_match('/^\.+$/', $file) && is_dir($path . DS . $file)) {
                        $this->_modes[] = "{$this->_path}/{$file}/{$file}.js";
                    }
                }

                closedir($dh);
            }
        }

        return $this;
    }

    /**
     * Get all available syntax modes as an option array.
     * 
     * @return array
     */
    public function toOptionArray()
    {
        $this->_loadModes();

        $options = array();

        foreach ($this->_modes as $mode) {
            $options[] = array(
                'value' => $mode,
                'label' => str_replace('.js', '', basename($mode)),
            );
        }

        return $options;
    }

}