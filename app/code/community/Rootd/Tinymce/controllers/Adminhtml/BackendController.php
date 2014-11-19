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

    protected $_publicActions = array('loadstoreassets');

    public function loadstoreassetsAction()
    {
        $output = '';

        if ( ($storeId = $this->getRequest()->getParam('id')) ) {
            $emulator           = Mage::getSingleton('core/app_emulation');
            $initialEnvironment = $emulator->startEnvironmentEmulation($storeId);

            // Simpler to render and parse the head than to re-write that block
            $headBlock = Mage::app()->getLayout()
                ->createBlock('page/html_head');

            $output = $headBlock->getCssJsHtml();

            $emulator->stopEnvironmentEmulation($initialEnvironment);
        }

        return $output;
    }

}