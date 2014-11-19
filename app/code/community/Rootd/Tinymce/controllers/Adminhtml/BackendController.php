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
        $output = '';

        if ( ($storeId = $this->getRequest()->getParam('id')) ) {
            $emulator           = Mage::getSingleton('core/app_emulation');
            $initialEnvironment = $emulator->startEnvironmentEmulation($storeId);

            $this->loadLayout();

            // Simpler to render and parse the head than to re-write that block
            $output = $this->getLayout()
                ->getBlock('head')
                ->getCssJsHtml();

            $emulator->stopEnvironmentEmulation($initialEnvironment);
        }

        $this->getResponse()
            ->setBody($output)
            ->sendResponse();
    }

}