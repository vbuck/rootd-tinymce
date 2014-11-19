<?php

/**
 * eTinyMCE backend controller.
 *
 * @package   Rootd_Tinymce
 * @author    Rick Buczynski <me@rickbuczynski.com>
 * @copyright 2014 Rick Buczynski. All Rights Reserved.
 */

class Rootd_Tinymce_Adminhtml_BackendController
    extends Mage_Adminhtml_Controller_Action
{

    // temporary
    protected $_publicActions = array('loadstoreassets');

    /**
     * Load store assets for applying to TinyMCE instance.
     * 
     * @return void
     */
    public function loadstoreassetsAction()
    {
        $assets = array();

        if ( ($storeId = $this->getRequest()->getParam('id')) ) {
            $emulator           = Mage::getSingleton('core/app_emulation');
            $initialEnvironment = $emulator->startEnvironmentEmulation($storeId);

            $this->loadLayout();

            $headBlock  = $this->getLayout()->getBlock('head');
            $items      = $headBlock->getData('items');

            foreach ($items as $key => $item) {
                $type = end( ( explode('.', basename($item['name'])) ) );

                if ( empty($item['if']) && strcasecmp($type, 'css') == 0 ) {
                    $css[$key] = $item;
                }
            }

            $headBlock->setData('items', $css);

            // Closest we can get without a lot of re-writes is to parse the final HTML
            $html = $headBlock->getCssJsHtml();

            preg_match_all('/href="([^"]*)"/', $html, $matches);

            $assets = end($matches);

            $emulator->stopEnvironmentEmulation($initialEnvironment);
        }

        $this->getResponse()
            ->setHeader('Content-Type', 'application/json')
            ->setBody(Mage::helper('core')->jsonEncode($assets))
            ->sendResponse();

        exit;
    }

}