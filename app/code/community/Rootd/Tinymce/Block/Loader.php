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
                'store_loader_url'      => Mage::helper('adminhtml')->getUrl('tinymce/adminhtml_backend/loadstoreassets', array('id' => '{{id}}')),
            )
        );
    }

    /**
     * Get the collection of stores as JSON.
     * 
     * @return string
     */
    public function getStoreConfigJson()
    {
        if (!$this->getData('store_config_json')) {
            $sites  = Mage::app()->getWebsites();
            $config = array(
                array(
                    'id'    => '',
                    'code'  => '',
                    'name'  => $this->__('Edit as Store:'),
                ),
            );

            foreach ($sites as $site) {
                $prefix = $site->getName();
                $groups = $site->getGroups();

                foreach ($groups as $group) {
                    $stores = $group->getStores();

                    foreach ($stores as $store) {
                        $config[] = array(
                            'id'    => $store->getId(),
                            'code'  => $store->getCode(),
                            'name'  => "{$prefix} - {$store->getName()}",
                        );
                    }
                }
            }

            $this->setData('store_config_json', Mage::helper('core')->jsonEncode($config));
        }

        return $this->getData('store_config_json');
    }

}