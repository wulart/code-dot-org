import GameButtons, {ResetButton} from '../templates/GameButtons';
import IFrameEmbedOverlay from '../templates/IFrameEmbedOverlay';
import * as color from "../util/color";
import * as applabConstants from './constants';
import React from 'react';
import Radium from 'radium';
import Visualization from './Visualization';
import CompletionButton from './CompletionButton';
import PlaySpaceHeader from './PlaySpaceHeader';
import PhoneFrame from './PhoneFrame';
import BelowVisualization from '../templates/BelowVisualization';
import {isResponsiveFromState} from '../templates/ProtectedVisualizationDiv';
import {connect} from 'react-redux';
import classNames from 'classnames';
import i18n from '@cdo/locale';

var styles = {
  completion: {
    display: 'inline'
  },
  phoneFrameCompletion: {
    display: 'block',
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    textAlign: 'center'
  },
  resetButtonWrapper: {
    position: 'absolute',
    bottom: 5,
    textAlign: 'center',
    width: '100%',
  },
  resetButton: {
    display: 'inline-block',
    width: 42,
    minWidth: 0,
    backgroundColor: color.dark_charcoal,
    borderColor: color.dark_charcoal,
    padding: 7,
    height: 42,
    marginLeft: 5,
    position: 'relative',
    left: 2,
    bottom: 2,
  },
  resetButtonImage: {
    marginLeft: 2,
    marginTop: -2,
  },
  containedInstructions: {
    marginTop: 10
  }
};

/**
 * Equivalent of visualizationColumn.html.ejs. Initially only supporting
 * portions used by App Lab
 */
var ApplabVisualizationColumn = React.createClass({
  propTypes: {
    isReadOnlyWorkspace: React.PropTypes.bool.isRequired,
    visualizationHasPadding: React.PropTypes.bool.isRequired,
    isShareView: React.PropTypes.bool.isRequired,
    isResponsive: React.PropTypes.bool.isRequired,
    nonResponsiveWidth: React.PropTypes.number.isRequired,
    isRunning: React.PropTypes.bool.isRequired,
    hideSource: React.PropTypes.bool.isRequired,
    interfaceMode: React.PropTypes.string.isRequired,
    playspacePhoneFrame: React.PropTypes.bool,
    isIframeEmbed: React.PropTypes.bool.isRequired,
    pinWorkspaceToBottom: React.PropTypes.bool.isRequired,
    isPaused: React.PropTypes.bool,
    awaitingContainedResponse: React.PropTypes.bool.isRequired,

    // non redux backed
    isEditingProject: React.PropTypes.bool.isRequired,
    screenIds: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    onScreenCreate: React.PropTypes.func.isRequired,
  },

  render: function () {
    let visualization = [
      <Visualization key="1"/>,
      (this.props.isIframeEmbed &&
       !this.props.isRunning &&
       <IFrameEmbedOverlay
         key="2"
         appWidth={applabConstants.APP_WIDTH}
         appHeight={applabConstants.APP_HEIGHT}
       />)
    ];
    // Share view still uses image for phone frame. Would eventually like it to
    // use same code
    if (this.props.playspacePhoneFrame) {
      // wrap our visualization in a phone frame
      visualization = (
        <PhoneFrame
          isDark={this.props.isRunning}
          showSelector={!this.props.isRunning}
          isPaused={this.props.isPaused}
          screenIds={this.props.screenIds}
          runButtonDisabled={this.props.awaitingContainedResponse}
          onScreenCreate={this.props.onScreenCreate}
        >
          {visualization}
        </PhoneFrame>
      );
    }
    const visualizationColumnClassNames = classNames({
      with_padding: this.props.visualizationHasPadding,
      responsive: this.props.isResponsive,
      pin_bottom: !this.props.hideSource && this.props.pinWorkspaceToBottom
    });

    return (
      <div
        id="visualizationColumn"
        className={visualizationColumnClassNames}
        style={[!this.props.isResponsive && {maxWidth: this.props.nonResponsiveWidth}]}
      >
        {!this.props.isReadOnlyWorkspace &&
          <PlaySpaceHeader
            isEditingProject={this.props.isEditingProject}
            screenIds={this.props.screenIds}
            onScreenCreate={this.props.onScreenCreate}
          />
        }
        {visualization}
        {this.props.isIframeEmbed &&
          <div style={styles.resetButtonWrapper}>
            <ResetButton
              hideText={true}
              style={styles.resetButton}
              imageStyle={styles.resetButtonImage}
            />
          </div>
        }
        <GameButtons>
          {/* This div is used to control whether or not our finish button is centered*/}
          <div
            style={[
              styles.completion,
              this.props.playspacePhoneFrame && styles.phoneFrameCompletion
            ]}
          >
            <CompletionButton/>
          </div>
        </GameButtons>
        {this.props.awaitingContainedResponse && (
          <div style={styles.containedInstructions}>
            {i18n.predictionInstructions()}
          </div>
        )}
        <BelowVisualization />
      </div>
    );
  }
});

export default connect(function propsFromStore(state) {
  return {
    isReadOnlyWorkspace: state.pageConstants.isReadOnlyWorkspace,
    visualizationHasPadding: state.pageConstants.visualizationHasPadding,
    isShareView: state.pageConstants.isShareView,
    isResponsive: isResponsiveFromState(state),
    nonResponsiveWidth: state.pageConstants.nonResponsiveVisualizationColumnWidth,
    isIframeEmbed: state.pageConstants.isIframeEmbed,
    hideSource: state.pageConstants.hideSource,
    isRunning: state.runState.isRunning,
    awaitingContainedResponse: state.runState.awaitingContainedResponse,
    isPaused: state.runState.isDebuggerPaused,
    interfaceMode: state.interfaceMode,
    playspacePhoneFrame: state.pageConstants.playspacePhoneFrame,
    pinWorkspaceToBottom: state.pageConstants.pinWorkspaceToBottom
  };
})(Radium(ApplabVisualizationColumn));
