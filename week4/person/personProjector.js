import {VALUE, VALID, EDITABLE, LABEL} from "../presentationModel/presentationModel.js";

export { personListItemProjector, personFormProjector }

const bindTextInput = (textAttr, inputElement) => {
    inputElement.oninput = _ => textAttr.setConvertedValue(inputElement.value);

    textAttr.getObs(VALUE).onChange(text => inputElement.value = text);

    textAttr.getObs(VALID, true).onChange(
        valid => valid
          ? inputElement.classList.remove("invalid")
          : inputElement.classList.add("invalid")
    );

    textAttr.getObs(EDITABLE, true).onChange(
        isEditable => isEditable
        ? inputElement.removeAttribute("readonly")
        : inputElement.setAttribute("readonly", true));

    // the label property should be shown as a pop-over on the text element.
    textAttr.getObs(LABEL,"").onChange(label => inputElement.setAttribute("title", label));

};

const personTextProjector = textAttr => {

    const inputElement = document.createElement("INPUT");
    inputElement.type = "text";
    inputElement.size = 20;

    bindTextInput(textAttr, inputElement);

    return inputElement;
};

const personListItemProjector = (masterController, selectionController, rootElement, person) => {

    const deleteButton      = document.createElement("Button");
    deleteButton.setAttribute("class","delete");
    deleteButton.innerHTML  = "&times;";
    deleteButton.onclick    = _ => masterController.removePerson(person);

    const firstnameInputElement = document.createElement("Firstname input"); // todo create the input fields and bind to the attribute props
    const lastnameInputElement  = document.createElement("Lastname input");

    // when a line in the master view is clicked, we have to set the selection
    firstnameInputElement.onfocus = _ => selectionController.setSelectedPerson(person);
    lastnameInputElement.onfocus  = _ => selectionController.setSelectedPerson(person);


    selectionController.onPersonSelected(
        selected => selected === person
          ? deleteButton.classList.add("selected")
          : deleteButton.classList.remove("selected")
    );

    masterController.onPersonRemove( (removedPerson, removeMe) => {
        if (removedPerson !== person) return;
        rootElement.removeChild(deleteButton);
        rootElement.removeChild(firstnameInputElement);
        rootElement.removeChild(lastnameInputElement);
        // what to do with selection when person was removed?
        selectionController.clearSelection();
        removeMe();
    } );

    rootElement.appendChild(deleteButton);
    rootElement.appendChild(firstnameInputElement);
    rootElement.appendChild(lastnameInputElement);
    // what to do with selection when person was added?
    selectionController.setSelectedPerson(person);
};

const personFormProjector = (detailController, rootElement, person) => {

    const divElement = document.createElement("DIV");
    divElement.innerHTML = `
    <FORM>
        <DIV class="detail-form">
            <LABEL for="firstname"></LABEL>
            <INPUT TYPE="text" size="20" id="firstname">   
            <LABEL for="lastname"></LABEL>
            <INPUT TYPE="text" size="20" id="lastname">   
        </DIV>
    </FORM>`;

    // bind text values
    bindTextInput(person.firstname, divElement.querySelector('#firstname'));
    bindTextInput(person.lastname,  divElement.querySelector('#lastname'));

    // bind label values
    person.firstname.getObs(LABEL,"").onChange(label => divElement.querySelector('[for=firstname]').textContent = label);
    person.lastname.getObs(LABEL,"").onChange(label => divElement.querySelector('[for=lastname]').textContent = label);

    rootElement.firstChild.replaceWith(divElement); // react - style ;-)
};
