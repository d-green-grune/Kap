import electron from 'electron';
import PropTypes from 'prop-types';
import React from 'react';
import css from 'styled-jsx/css';

import IconMenu from '../../icon-menu';
import {
  MoreIcon,
  CropIcon,
  ApplicationsIcon,
  FullscreenIcon,
  ExitFullscreenIcon
} from '../../../vectors';
import {connect, ActionBarContainer, CropperContainer} from '../../../containers';

const mainStyle = css`
  .main {
    height: 64px;
    display: flex;
    flex: 1;
    align-items: center;
  }
`;

const MainControls = {};

const remote = electron.remote || false;

class Left extends React.Component {
  // The menu lists the open windows, so it is built when it opens.
  // Building it when each cropper rendered delayed the cropper launch and showed an outdated list.
  openMenu = async options => {
    const {buildWindowsMenu} = remote.require('./utils/windows');
    const menu = await buildWindowsMenu(this.props.selectedApp);
    menu.popup(options);
  };

  render() {
    const {toggleAdvanced, selectedApp, advanced} = this.props;

    return (
      <div className="main">
        <div className="crop">
          <CropIcon tabIndex={advanced ? -1 : 0} onClick={toggleAdvanced}/>
        </div>
        <IconMenu isMenu icon={ApplicationsIcon} tabIndex={advanced ? -1 : 0} active={Boolean(selectedApp)} onOpen={this.openMenu}/>
        <style jsx>{mainStyle}</style>
        <style jsx>{`
          .crop {
            margin-left: 32px;
            margin-right: 64px;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        `}</style>
      </div>
    );
  }
}

Left.propTypes = {
  toggleAdvanced: PropTypes.elementType.isRequired,
  selectedApp: PropTypes.string,
  advanced: PropTypes.bool
};

MainControls.Left = connect(
  [CropperContainer, ActionBarContainer],
  ({selectedApp}, {advanced}) => ({selectedApp, advanced}),
  (_, {toggleAdvanced}) => ({toggleAdvanced})
)(Left);

class Right extends React.Component {
  onCogMenuClick = async () => {
    const cogMenu = await electron.remote.require('./menus/cog').getCogMenu();
    cogMenu.popup();
  };

  render() {
    const {enterFullscreen, exitFullscreen, isFullscreen, advanced} = this.props;

    return (
      <div className="main">
        <div className="fullscreen">
          {
            isFullscreen ?
              <ExitFullscreenIcon active tabIndex={advanced ? -1 : 0} onClick={exitFullscreen}/> :
              <FullscreenIcon tabIndex={advanced ? -1 : 0} onClick={enterFullscreen}/>
          }
        </div>
        <IconMenu isMenu icon={MoreIcon} tabIndex={advanced ? -1 : 0} onOpen={this.onCogMenuClick}/>
        <style jsx>{mainStyle}</style>
        <style jsx>{`
          .fullscreen {
            margin-left: 56px;
            margin-right: 64px;
            height: 24px;
          }
        `}</style>
      </div>
    );
  }
}

Right.propTypes = {
  enterFullscreen: PropTypes.elementType.isRequired,
  exitFullscreen: PropTypes.elementType.isRequired,
  isFullscreen: PropTypes.bool,
  advanced: PropTypes.bool
};

MainControls.Right = connect(
  [CropperContainer, ActionBarContainer],
  ({isFullscreen}, {advanced}) => ({isFullscreen, advanced}),
  ({enterFullscreen, exitFullscreen}) => ({enterFullscreen, exitFullscreen})
)(Right);

export default MainControls;
