let storeContainer = { store: null };
export default storeContainer;

export function observeStore(select, onChange) {
  if(!storeContainer.store) {
    throw new Error("store was not initialized");
  }

  let currentState;

  function handleChange() {
    let nextState = select(storeContainer.store.getState());
    if (nextState !== currentState) {
      currentState = nextState;
      onChange(currentState);
    }
  }

  let unsubscribe = storeContainer.store.subscribe(handleChange);
  handleChange();
  return unsubscribe;
}
