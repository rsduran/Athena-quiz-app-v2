import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Text } from '@chakra-ui/react';

interface UrlsModalProps {
    isOpen: boolean;
    onClose: () => void;
    rawUrls: string;
}

const UrlsModal: React.FC<UrlsModalProps> = ({ isOpen, onClose, rawUrls }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>URLs</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Text whiteSpace="pre-wrap">{rawUrls || 'No URLs available.'}</Text>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default UrlsModal;