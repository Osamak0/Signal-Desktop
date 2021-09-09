// Copyright 2021 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import { assert } from 'chai';
import * as sinon from 'sinon';
import { reducer as rootReducer } from '../../../state/reducer';
import { noopAction } from '../../../state/ducks/noop';
import { DEFAULT_PREFERRED_REACTION_EMOJI } from '../../../reactions/constants';

import {
  PreferredReactionsStateType,
  actions,
  getInitialState,
  reducer,
} from '../../../state/ducks/preferredReactions';

describe('preferred reactions duck', () => {
  const getEmptyRootState = () => rootReducer(undefined, noopAction());

  const getRootState = (preferredReactions: PreferredReactionsStateType) => ({
    ...getEmptyRootState(),
    preferredReactions,
  });

  const stateWithOpenCustomizationModal = {
    ...getInitialState(),
    customizePreferredReactionsModal: {
      draftPreferredReactions: [
        'sparkles',
        'sparkle',
        'sparkler',
        'shark',
        'sparkling_heart',
        'parking',
      ],
      originalPreferredReactions: [
        'blue_heart',
        'thumbsup',
        'thumbsdown',
        'joy',
        'open_mouth',
        'cry',
      ],
      selectedDraftEmojiIndex: undefined,
      isSaving: false as const,
      hadSaveError: false,
    },
  };

  const stateWithOpenCustomizationModalAndSelectedEmoji = {
    ...stateWithOpenCustomizationModal,
    customizePreferredReactionsModal: {
      ...stateWithOpenCustomizationModal.customizePreferredReactionsModal,
      selectedDraftEmojiIndex: 1,
    },
  };

  let sinonSandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sinonSandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sinonSandbox.restore();
  });

  describe('cancelCustomizePreferredReactionsModal', () => {
    const { cancelCustomizePreferredReactionsModal } = actions;

    it("does nothing if the modal isn't open", () => {
      const action = cancelCustomizePreferredReactionsModal();
      const result = reducer(getInitialState(), action);

      assert.notProperty(result, 'customizePreferredReactionsModal');
    });

    it('closes the modal if open', () => {
      const action = cancelCustomizePreferredReactionsModal();
      const result = reducer(stateWithOpenCustomizationModal, action);

      assert.notProperty(result, 'customizePreferredReactionsModal');
    });
  });

  describe('deselectDraftEmoji', () => {
    const { deselectDraftEmoji } = actions;

    it('is a no-op if the customization modal is not open', () => {
      const state = getInitialState();
      const action = deselectDraftEmoji();
      const result = reducer(state, action);

      assert.strictEqual(result, state);
    });

    it('is a no-op if no emoji is selected', () => {
      const action = deselectDraftEmoji();
      const result = reducer(stateWithOpenCustomizationModal, action);

      assert.isUndefined(
        result.customizePreferredReactionsModal?.selectedDraftEmojiIndex
      );
    });

    it('deselects a currently-selected emoji', () => {
      const action = deselectDraftEmoji();
      const result = reducer(
        stateWithOpenCustomizationModalAndSelectedEmoji,
        action
      );

      assert.isUndefined(
        result.customizePreferredReactionsModal?.selectedDraftEmojiIndex
      );
    });
  });

  describe('openCustomizePreferredReactionsModal', () => {
    const { openCustomizePreferredReactionsModal } = actions;

    it('opens the customization modal with defaults if no value was stored', () => {
      const dispatch = sinon.spy();
      openCustomizePreferredReactionsModal()(dispatch, getEmptyRootState, null);
      const [action] = dispatch.getCall(0).args;

      const result = reducer(getEmptyRootState().preferredReactions, action);

      assert.deepEqual(result.customizePreferredReactionsModal, {
        draftPreferredReactions: DEFAULT_PREFERRED_REACTION_EMOJI,
        originalPreferredReactions: DEFAULT_PREFERRED_REACTION_EMOJI,
        selectedDraftEmojiIndex: undefined,
        isSaving: false,
        hadSaveError: false,
      });
    });

    it('opens the customization modal with stored values', () => {
      const storedPreferredReactionEmoji = [
        'sparkles',
        'sparkle',
        'sparkler',
        'shark',
        'sparkling_heart',
        'parking',
      ];

      const emptyRootState = getEmptyRootState();
      const state = {
        ...emptyRootState,
        items: {
          ...emptyRootState.items,
          preferredReactionEmoji: storedPreferredReactionEmoji,
        },
      };

      const dispatch = sinon.spy();
      openCustomizePreferredReactionsModal()(dispatch, () => state, null);
      const [action] = dispatch.getCall(0).args;

      const result = reducer(state.preferredReactions, action);

      assert.deepEqual(result.customizePreferredReactionsModal, {
        draftPreferredReactions: storedPreferredReactionEmoji,
        originalPreferredReactions: storedPreferredReactionEmoji,
        selectedDraftEmojiIndex: undefined,
        isSaving: false,
        hadSaveError: false,
      });
    });
  });

  describe('replaceSelectedDraftEmoji', () => {
    const { replaceSelectedDraftEmoji } = actions;

    it('is a no-op if the customization modal is not open', () => {
      const state = getInitialState();
      const action = replaceSelectedDraftEmoji('cat');
      const result = reducer(state, action);

      assert.strictEqual(result, state);
    });

    it('is a no-op if no emoji is selected', () => {
      const action = replaceSelectedDraftEmoji('cat');
      const result = reducer(stateWithOpenCustomizationModal, action);

      assert.strictEqual(result, stateWithOpenCustomizationModal);
    });

    it('is a no-op if the new emoji is already in the list', () => {
      const action = replaceSelectedDraftEmoji('shark');
      const result = reducer(
        stateWithOpenCustomizationModalAndSelectedEmoji,
        action
      );

      assert.strictEqual(
        result,
        stateWithOpenCustomizationModalAndSelectedEmoji
      );
    });

    it('replaces the selected draft emoji and deselects', () => {
      const action = replaceSelectedDraftEmoji('cat');
      const result = reducer(
        stateWithOpenCustomizationModalAndSelectedEmoji,
        action
      );

      assert.deepStrictEqual(
        result.customizePreferredReactionsModal?.draftPreferredReactions,
        ['sparkles', 'cat', 'sparkler', 'shark', 'sparkling_heart', 'parking']
      );
      assert.isUndefined(
        result.customizePreferredReactionsModal?.selectedDraftEmojiIndex
      );
    });
  });

  describe('resetDraftEmoji', () => {
    const { resetDraftEmoji } = actions;

    it('is a no-op if the customization modal is not open', () => {
      const state = getInitialState();
      const action = resetDraftEmoji();
      const result = reducer(state, action);

      assert.strictEqual(result, state);
    });

    it('resets the draft emoji to the defaults', () => {
      const action = resetDraftEmoji();
      const result = reducer(stateWithOpenCustomizationModal, action);

      assert.deepEqual(
        result.customizePreferredReactionsModal?.draftPreferredReactions,
        DEFAULT_PREFERRED_REACTION_EMOJI
      );
    });

    it('deselects any selected emoji', () => {
      const action = resetDraftEmoji();
      const result = reducer(
        stateWithOpenCustomizationModalAndSelectedEmoji,
        action
      );

      assert.isUndefined(
        result.customizePreferredReactionsModal?.selectedDraftEmojiIndex
      );
    });
  });

  describe('savePreferredReactions', () => {
    const { savePreferredReactions } = actions;

    let storagePutStub: sinon.SinonStub;
    beforeEach(() => {
      storagePutStub = sinonSandbox.stub(window.storage, 'put').resolves();
    });

    describe('thunk', () => {
      it('saves the preferred reaction emoji to storage', async () => {
        await savePreferredReactions()(
          sinon.spy(),
          () => getRootState(stateWithOpenCustomizationModal),
          null
        );

        sinon.assert.calledWith(
          storagePutStub,
          'preferredReactionEmoji',
          stateWithOpenCustomizationModal.customizePreferredReactionsModal
            .draftPreferredReactions
        );
      });

      it('on success, dispatches a pending action followed by a fulfilled action', async () => {
        const dispatch = sinon.spy();
        await savePreferredReactions()(
          dispatch,
          () => getRootState(stateWithOpenCustomizationModal),
          null
        );

        sinon.assert.calledTwice(dispatch);
        sinon.assert.calledWith(dispatch, {
          type: 'preferredReactions/SAVE_PREFERRED_REACTIONS_PENDING',
        });
        sinon.assert.calledWith(dispatch, {
          type: 'preferredReactions/SAVE_PREFERRED_REACTIONS_FULFILLED',
        });
      });

      it('on failure, dispatches a pending action followed by a rejected action', async () => {
        storagePutStub.rejects(new Error('something went wrong'));

        const dispatch = sinon.spy();
        await savePreferredReactions()(
          dispatch,
          () => getRootState(stateWithOpenCustomizationModal),
          null
        );

        sinon.assert.calledTwice(dispatch);
        sinon.assert.calledWith(dispatch, {
          type: 'preferredReactions/SAVE_PREFERRED_REACTIONS_PENDING',
        });
        sinon.assert.calledWith(dispatch, {
          type: 'preferredReactions/SAVE_PREFERRED_REACTIONS_REJECTED',
        });
      });
    });

    describe('SAVE_PREFERRED_REACTIONS_FULFILLED', () => {
      const action = {
        type: 'preferredReactions/SAVE_PREFERRED_REACTIONS_FULFILLED' as const,
      };

      it("does nothing if the modal isn't open", () => {
        const result = reducer(getInitialState(), action);

        assert.notProperty(result, 'customizePreferredReactionsModal');
      });

      it('closes the modal if open', () => {
        const result = reducer(stateWithOpenCustomizationModal, action);

        assert.notProperty(result, 'customizePreferredReactionsModal');
      });
    });

    describe('SAVE_PREFERRED_REACTIONS_PENDING', () => {
      const action = {
        type: 'preferredReactions/SAVE_PREFERRED_REACTIONS_PENDING' as const,
      };

      it('marks the modal as "saving"', () => {
        const result = reducer(stateWithOpenCustomizationModal, action);

        assert.isTrue(result.customizePreferredReactionsModal?.isSaving);
      });

      it('clears any previous errors', () => {
        const state = {
          ...stateWithOpenCustomizationModal,
          customizePreferredReactionsModal: {
            ...stateWithOpenCustomizationModal.customizePreferredReactionsModal,
            hadSaveError: true,
          },
        };
        const result = reducer(state, action);

        assert.isFalse(result.customizePreferredReactionsModal?.hadSaveError);
      });

      it('deselects any selected emoji', () => {
        const result = reducer(
          stateWithOpenCustomizationModalAndSelectedEmoji,
          action
        );

        assert.isUndefined(
          result.customizePreferredReactionsModal?.selectedDraftEmojiIndex
        );
      });
    });

    describe('SAVE_PREFERRED_REACTIONS_REJECTED', () => {
      const action = {
        type: 'preferredReactions/SAVE_PREFERRED_REACTIONS_REJECTED' as const,
      };

      it("does nothing if the modal isn't open", () => {
        const state = getInitialState();
        const result = reducer(state, action);

        assert.strictEqual(result, state);
      });

      it('stops loading', () => {
        const result = reducer(stateWithOpenCustomizationModal, action);

        assert.isFalse(result.customizePreferredReactionsModal?.isSaving);
      });

      it('saves that there was an error', () => {
        const result = reducer(stateWithOpenCustomizationModal, action);

        assert.isTrue(result.customizePreferredReactionsModal?.hadSaveError);
      });
    });
  });

  describe('selectDraftEmojiToBeReplaced', () => {
    const { selectDraftEmojiToBeReplaced } = actions;

    it('is a no-op if the customization modal is not open', () => {
      const state = getInitialState();
      const action = selectDraftEmojiToBeReplaced(2);
      const result = reducer(state, action);

      assert.strictEqual(result, state);
    });

    it('is a no-op if the index is out of range', () => {
      const action = selectDraftEmojiToBeReplaced(99);
      const result = reducer(stateWithOpenCustomizationModal, action);

      assert.strictEqual(result, stateWithOpenCustomizationModal);
    });

    it('sets the index as the selected one', () => {
      const action = selectDraftEmojiToBeReplaced(3);
      const result = reducer(stateWithOpenCustomizationModal, action);

      assert.strictEqual(
        result.customizePreferredReactionsModal?.selectedDraftEmojiIndex,
        3
      );
    });
  });
});
