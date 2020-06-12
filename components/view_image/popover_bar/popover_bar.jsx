// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

export default class PopoverBar extends React.PureComponent {
    static propTypes = {
        fileIndex: PropTypes.number.isRequired,
        totalFiles: PropTypes.number.isRequired,
        filename: PropTypes.string.isRequired,
        fileURL: PropTypes.string.isRequired,
        showPublicLink: PropTypes.bool,
        enablePublicLink: PropTypes.bool.isRequired,
        canDownloadFiles: PropTypes.bool.isRequired,
        isExternalFile: PropTypes.bool.isRequired,
        onGetPublicLink: PropTypes.func,
    };

    static defaultProps = {
        fileIndex: 0,
        totalFiles: 0,
        filename: '',
        fileURL: '',
        showPublicLink: true,
    };

    createImage(options) {
        options = options || {};
        const img = (Image) ? new Image() : document.createElement("img");
        if (options.src) {
            img.src = options.src;
        }
        return img;
      }
             
      convertToPng(imgBlob) {
        const imageUrl = window.URL.createObjectURL(imgBlob);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const imageEl = this.createImage({ src: imageUrl });
        imageEl.onload = (e) => {
          canvas.width = e.target.width;
          canvas.height = e.target.height;
          ctx.drawImage(e.target, 0, 0, e.target.width, e.target.height);
          canvas.toBlob(this.copyToClipboard, "image/png", 1);
        };      
      }
      
      async copyImg(src, link) {
         const img = await fetch(link);
         const imgBlob = await img.blob();
         if (src.endsWith(".jpg") || src.endsWith(".jpeg")) {
           this.convertToPng(imgBlob);
         } else if (src.endsWith(".png")) {
           this.copyToClipboard(imgBlob);
         } else {
           console.error("Format unsupported");
         }
      }
      
      async copyToClipboard(pngBlob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({
                  [pngBlob.type]: pngBlob
              })
            ]);
            console.log("Image copied");
          } catch (error) {
              console.error(error);
          }
      }

    render() {
        var publicLink = '';
        if (this.props.enablePublicLink && this.props.showPublicLink) {
            publicLink = (
                <div>
                    <a
                        href='#'
                        className='public-link text'
                        data-title='Public Image'
                        onClick={this.props.onGetPublicLink}
                    >
                        <FormattedMessage
                            id='view_image_popover.publicLink'
                            defaultMessage='Get a public link'
                        />
                    </a>
                    <span className='text'>{' | '}</span>
                </div>
            );
        }

        let downloadLinks = null;
        let copyLinks = null;
        if (this.props.canDownloadFiles) {
            let downloadLinkText;
            const downloadLinkProps = {};
            if (this.props.isExternalFile) {
                downloadLinkText = (
                    <FormattedMessage
                        id='view_image_popover.open'
                        defaultMessage='Open'
                    />
                );
            } else {
                downloadLinkText = (
                    <FormattedMessage
                        id='view_image_popover.download'
                        defaultMessage='Download'
                    />
                );

                downloadLinkProps.download = this.props.filename;
            }

            let copyLinkText;
            const copyLinkProps = {};
            if (this.props.isExternalFile) {
                copyLinkText = (
                    <FormattedMessage
                        id='view_image_popover.open'
                        defaultMessage='Open'
                    />
                );
            } else {
                copyLinkText = (
                    <FormattedMessage
                        id='view_image_popover.copy'
                        defaultMessage='Copy'
                    />
                );

                copyLinkProps.copy = this.props.filename;
            }

            downloadLinks = (
                <div className='image-links'>
                    {publicLink}
                    <a
                        href={this.props.fileURL}
                        className='text'
                        target='_blank'
                        rel='noopener noreferrer'
                        {...downloadLinkProps}
                    >
                        {downloadLinkText}
                    </a>
                </div>
            );

            copyLinks = (
                <div className='image-links' onClick={()=>this.copyImg(this.props.filename, this.props.fileURL)}>
                    <a
                        // href={this.props.fileURL}
                        className='text'
                        target='_blank'
                        rel='noopener noreferrer'
                        {...copyLinkProps}
                    >
                        {copyLinkText}
                    </a>
                </div>
            );
        }

        return (
            <div
                data-testid='fileCountFooter'
                ref='imageFooter'
                className='modal-button-bar'
            >
                <span className='pull-left text'>
                    <FormattedMessage
                        id='view_image_popover.file'
                        defaultMessage='File {count, number} of {total, number}'
                        values={{
                            count: (this.props.fileIndex + 1),
                            total: this.props.totalFiles,
                        }}
                    />
                </span>
                {downloadLinks}
                {copyLinks}
            </div>
        );
    }
}
