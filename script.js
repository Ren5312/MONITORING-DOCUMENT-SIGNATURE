let documents =
    JSON.parse(localStorage.getItem("documents")) || [];

let editingId = null;


/* SAVE DATA */

function saveData() {

    localStorage.setItem(
        "documents",
        JSON.stringify(documents)
    );

}


/* OPEN MODAL */

function openModal() {

    editingId = null;

    document.getElementById("modalTitle").textContent =
        "Add Document";

    document.getElementById("documentForm").reset();

    document.getElementById("signatoryContainer").innerHTML = `
        <div class="signatory">

            <input
                type="text"
                placeholder="Signatory name"
                class="signatory-name"
                required
            >

            <label class="checkbox-label">

                <input
                    type="checkbox"
                    class="signatory-status"
                >

                Signed

            </label>

        </div>
    `;

    document.getElementById("documentModal").style.display =
        "flex";
}


/* CLOSE MODAL */

function closeModal() {

    document.getElementById("documentModal").style.display =
        "none";

}


/* ADD SIGNATORY */

function addSignatory() {

    const container =
        document.getElementById("signatoryContainer");

    const div = document.createElement("div");

    div.className = "signatory";

    div.innerHTML = `

        <input
            type="text"
            placeholder="Signatory name"
            class="signatory-name"
            required
        >

        <label class="checkbox-label">

            <input
                type="checkbox"
                class="signatory-status"
            >

            Signed

        </label>

    `;

    container.appendChild(div);

}


/* FORM SUBMIT */

document
    .getElementById("documentForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();

        const name =
            document.getElementById("documentName").value;

        const schoolYear =
            document.getElementById("schoolYear").value;

        const semester =
            document.getElementById("semester").value;

        const remarks =
            document.getElementById("remarks").value;


        const names =
            document.querySelectorAll(".signatory-name");

        const statuses =
            document.querySelectorAll(".signatory-status");


        let signatories = [];


        names.forEach((input, index) => {

            if (input.value.trim() !== "") {

                signatories.push({

                    name: input.value.trim(),

                    signed: statuses[index].checked

                });

            }

        });


        if (signatories.length === 0) {

            alert("Please add at least one signatory.");

            return;

        }


        const completed =
            signatories.every(person => person.signed);


        const documentData = {

            id:
                editingId ||
                Date.now(),

            name,

            schoolYear,

            semester,

            signatories,

            remarks:
                completed
                    ? "Completed"
                    : "Pending"

        };


        if (editingId) {

            const index =
                documents.findIndex(
                    doc => doc.id === editingId
                );

            documents[index] = documentData;

        } else {

            documents.push(documentData);

        }


        saveData();

        displayDocuments();

        closeModal();

    });


/* DISPLAY DOCUMENTS */

function displayDocuments() {

    const table =
        document.getElementById("documentTable");

    const search =
        document
            .getElementById("searchInput")
            .value
            .toLowerCase();


    table.innerHTML = "";


    const filtered =
        documents.filter(doc =>
            doc.name
                .toLowerCase()
                .includes(search)
        );


    if (filtered.length === 0) {

        document.getElementById("emptyMessage")
            .style.display = "block";

    } else {

        document.getElementById("emptyMessage")
            .style.display = "none";

    }


    filtered.forEach((doc, index) => {

        const completed =
            doc.signatories.every(
                person => person.signed
            );


        const signatories =
            doc.signatories
                .map(person => `

                    <div class="signatory-item">

                        <input
                            type="checkbox"
                            ${person.signed ? "checked" : ""}
                            onchange="
                                toggleSignature(
                                    ${doc.id},
                                    '${escapeText(person.name)}'
                                )
                            "
                        >

                        <span
                            class="${person.signed ? "signed" : ""}"
                        >
                            ${escapeHTML(person.name)}
                        </span>

                    </div>

                `)
                .join("");


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>${index + 1}</td>

            <td>
                <strong>
                    ${escapeHTML(doc.name)}
                </strong>
            </td>

            <td>
                ${escapeHTML(doc.schoolYear)}
            </td>

            <td>
                ${escapeHTML(doc.semester)}
            </td>

            <td>

                <div class="signatory-list">

                    ${signatories}

                </div>

            </td>

            <td>

                <span
                    class="status ${
                        completed
                            ? "completed"
                            : "pending"
                    }"
                >

                    ${
                        completed
                            ? "Completed"
                            : "Pending"
                    }

                </span>

            </td>

            <td>
                ${
                    completed
                        ? "All documents signed"
                        : "Waiting for signature"
                }
            </td>

            <td>

                <button
                    class="edit-btn"
                    onclick="editDocument(${doc.id})"
                >
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteDocument(${doc.id})"
                >
                    Delete
                </button>

            </td>

        `;


        table.appendChild(row);

    });


    updateDashboard();

}


/* TOGGLE SIGNATURE */

function toggleSignature(id, name) {

    const doc =
        documents.find(
            document => document.id === id
        );


    if (!doc) return;


    const person =
        doc.signatories.find(
            person => person.name === name
        );


    if (!person) return;


    person.signed =
        !person.signed;


    saveData();

    displayDocuments();

}


/* EDIT */

function editDocument(id) {

    const doc =
        documents.find(
            document => document.id === id
        );


    if (!doc) return;


    editingId = id;


    document.getElementById("modalTitle")
        .textContent =
        "Edit Document";


    document.getElementById("documentName")
        .value = doc.name;


    document.getElementById("schoolYear")
        .value = doc.schoolYear;


    document.getElementById("semester")
        .value = doc.semester;


    document.getElementById("remarks")
        .value = doc.remarks;


    const container =
        document.getElementById(
            "signatoryContainer"
        );


    container.innerHTML = "";


    doc.signatories.forEach(person => {

        const div =
            document.createElement("div");

        div.className = "signatory";


        div.innerHTML = `

            <input
                type="text"
                class="signatory-name"
                value="${escapeHTML(person.name)}"
                required
            >

            <label class="checkbox-label">

                <input
                    type="checkbox"
                    class="signatory-status"
                    ${
                        person.signed
                            ? "checked"
                            : ""
                    }
                >

                Signed

            </label>

        `;


        container.appendChild(div);

    });


    document.getElementById("documentModal")
        .style.display = "flex";

}


/* DELETE */

function deleteDocument(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this document?"
        );


    if (!confirmDelete) return;


    documents =
        documents.filter(
            doc => doc.id !== id
        );


    saveData();

    displayDocuments();

}


/* DASHBOARD */

function updateDashboard() {

    const total =
        documents.length;


    const completed =
        documents.filter(doc =>
            doc.signatories.every(
                person => person.signed
            )
        ).length;


    const pending =
        total - completed;


    document.getElementById(
        "totalDocuments"
    ).textContent = total;


    document.getElementById(
        "completedDocuments"
    ).textContent = completed;


    document.getElementById(
        "pendingDocuments"
    ).textContent = pending;

}


/* SECURITY HELPERS */

function escapeHTML(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function escapeText(text) {

    return String(text)
        .replace(/'/g, "\\'");

}


/* INITIAL LOAD */

displayDocuments();
