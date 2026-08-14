/* =====================================================
   DOCUMENT SIGNATURE MONITORING SYSTEM
   ===================================================== */


/* ================= DATA ================= */

let documents =
    JSON.parse(
        localStorage.getItem("documentMonitoring")
    ) || [];


let editingId = null;



/* ================= SAVE DATA ================= */

function saveData() {

    localStorage.setItem(
        "documentMonitoring",
        JSON.stringify(documents)
    );

}



/* ================= OPEN ADD MODAL ================= */

function openAddModal() {

    editingId = null;

    document.getElementById(
        "modalTitle"
    ).textContent = "Add Document";


    document.getElementById(
        "documentForm"
    ).reset();


    document.getElementById(
        "documentId"
    ).value = "";


    document.getElementById(
        "signatoriesContainer"
    ).innerHTML = "";


    document.getElementById(
        "receivedContainer"
    ).innerHTML = "";


    addSignatoryField();

    addReceivedField();


    document.getElementById(
        "documentDate"
    ).value =
        new Date().toISOString().split("T")[0];


    document.getElementById(
        "documentModal"
    ).style.display = "flex";

}



/* ================= CLOSE MODAL ================= */

function closeModal() {

    document.getElementById(
        "documentModal"
    ).style.display = "none";

}



/* ================= ADD SIGNATORY FIELD ================= */

function addSignatoryField(
    name = "",
    dateTime = "",
    checked = false
) {

    const container =
        document.getElementById(
            "signatoriesContainer"
        );


    const div =
        document.createElement("div");


    div.className =
        "form-person";


    div.innerHTML = `

        <input
            type="text"
            class="signatory-name"
            placeholder="Name"
            value="${escapeHTML(name)}"
            required
        >

        <input
            type="datetime-local"
            class="signatory-time"
            value="${dateTime}"
        >

        <button
            type="button"
            class="remove-person"
            onclick="this.parentElement.remove()"
        >
            ×
        </button>

    `;


    container.appendChild(div);

}



/* ================= ADD RECEIVED FIELD ================= */

function addReceivedField(
    name = "",
    dateTime = "",
    checked = false
) {

    const container =
        document.getElementById(
            "receivedContainer"
        );


    const div =
        document.createElement("div");


    div.className =
        "form-person";


    div.innerHTML = `

        <input
            type="text"
            class="received-name"
            placeholder="Name"
            value="${escapeHTML(name)}"
            required
        >

        <input
            type="datetime-local"
            class="received-time"
            value="${dateTime}"
        >

        <button
            type="button"
            class="remove-person"
            onclick="this.parentElement.remove()"
        >
            ×
        </button>

    `;


    container.appendChild(div);

}



/* ================= FORM SUBMIT ================= */

document
    .getElementById("documentForm")
    .addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const date =
                document.getElementById(
                    "documentDate"
                ).value;


            const documentName =
                document.getElementById(
                    "documentName"
                ).value.trim();


            const trustedBy =
                document.getElementById(
                    "trustedBy"
                ).value.trim();


            const remark =
                document.getElementById(
                    "remark"
                ).value;



            /* ===== SIGNATORIES ===== */

            const signatoryRows =
                document.querySelectorAll(
                    "#signatoriesContainer .form-person"
                );


            let signatories = [];


            signatoryRows.forEach(row => {

                const name =
                    row.querySelector(
                        ".signatory-name"
                    ).value.trim();


                const dateTime =
                    row.querySelector(
                        ".signatory-time"
                    ).value;


                if (name !== "") {

                    signatories.push({

                        name: name,

                        dateTime: dateTime,

                        signed: true

                    });

                }

            });



            /* ===== RECEIVED BY ===== */

            const receivedRows =
                document.querySelectorAll(
                    "#receivedContainer .form-person"
                );


            let receivedBy = [];


            receivedRows.forEach(row => {

                const name =
                    row.querySelector(
                        ".received-name"
                    ).value.trim();


                const dateTime =
                    row.querySelector(
                        ".received-time"
                    ).value;


                if (name !== "") {

                    receivedBy.push({

                        name: name,

                        dateTime: dateTime

                    });

                }

            });



            /* ===== CREATE DOCUMENT ===== */

            const newDocument = {

                id:
                    editingId ||
                    Date.now(),

                date,

                documentName,

                trustedBy,

                signatories,

                receivedBy,

                remark

            };



            /* ===== UPDATE ===== */

            if (editingId !== null) {

                const index =
                    documents.findIndex(
                        doc =>
                            doc.id === editingId
                    );


                if (index !== -1) {

                    documents[index] =
                        newDocument;

                }

            }


            /* ===== ADD ===== */

            else {

                documents.push(
                    newDocument
                );

            }



            saveData();

            displayDocuments();

            closeModal();

        }
    );



/* ================= DISPLAY DOCUMENTS ================= */

function displayDocuments() {

    const tableBody =
        document.getElementById(
            "documentTableBody"
        );


    const search =
        document.getElementById(
            "searchInput"
        ).value
            .toLowerCase();


    tableBody.innerHTML = "";


    const filteredDocuments =
        documents.filter(doc =>

            doc.documentName
                .toLowerCase()
                .includes(search)

        );


    document.getElementById(
        "emptyMessage"
    ).style.display =
        filteredDocuments.length === 0
            ? "block"
            : "none";



    filteredDocuments.forEach(
        (doc, index) => {

            const row =
                document.createElement(
                    "tr"
                );



            /* ===== SIGNATORIES HTML ===== */

            let signatoriesHTML = `

                <div class="people-header">

                    <span></span>

                    <span>NAME</span>

                    <span>DATE & TIME</span>

                </div>

            `;


            if (
                doc.signatories &&
                doc.signatories.length > 0
            ) {

                doc.signatories.forEach(
                    person => {

                        signatoriesHTML += `

                            <div
                                class="person-row"
                            >

                                <input
                                    type="checkbox"
                                    checked
                                    disabled
                                >

                                <span
                                    class="person-name"
                                >
                                    ${escapeHTML(
                                        person.name
                                    )}
                                </span>

                                <span
                                    class="person-time"
                                >
                                    ${formatDateTime(
                                        person.dateTime
                                    )}
                                </span>

                            </div>

                        `;

                    }
                );

            }



            /* ===== RECEIVED BY HTML ===== */

            let receivedHTML = `

                <div class="people-header">

                    <span></span>

                    <span>NAME</span>

                    <span>DATE & TIME</span>

                </div>

            `;


            if (
                doc.receivedBy &&
                doc.receivedBy.length > 0
            ) {

                doc.receivedBy.forEach(
                    person => {

                        receivedHTML += `

                            <div
                                class="person-row"
                            >

                                <input
                                    type="checkbox"
                                    checked
                                    disabled
                                >

                                <span
                                    class="person-name"
                                >
                                    ${escapeHTML(
                                        person.name
                                    )}
                                </span>

                                <span
                                    class="person-time"
                                >
                                    ${formatDateTime(
                                        person.dateTime
                                    )}
                                </span>

                            </div>

                        `;

                    }
                );

            }



            /* ===== REMARK ===== */

            let remarkClass =
                "pending";


            if (
                doc.remark ===
                "Completed"
            ) {

                remarkClass =
                    "completed";

            }


            if (
                doc.remark ===
                "For Follow-up"
            ) {

                remarkClass =
                    "followup";

            }



            /* ===== ROW ===== */

            row.innerHTML = `

                <td>

                    ${formatDate(
                        doc.date
                    )}

                </td>


                <td>

                    <strong>

                        ${escapeHTML(
                            doc.documentName
                        )}

                    </strong>

                </td>


                <td>

                    ${escapeHTML(
                        doc.trustedBy
                    )}

                </td>


                <td>

                    ${signatoriesHTML}

                </td>


                <td>

                    ${receivedHTML}

                </td>


                <td>

                    <span
                        class="remark
                        ${remarkClass}"
                    >

                        ${escapeHTML(
                            doc.remark
                        )}

                    </span>

                </td>


                <td>

                    <div
                        class="action-buttons"
                    >

                        <button
                            class="edit-btn"
                            onclick="editDocument(
                                ${doc.id}
                            )"
                        >

                            Edit

                        </button>


                        <button
                            class="delete-btn"
                            onclick="deleteDocument(
                                ${doc.id}
                            )"
                        >

                            Delete

                        </button>

                    </div>

                </td>

            `;


            tableBody.appendChild(row);

        }
    );


    updateDashboard();

}



/* ================= EDIT DOCUMENT ================= */

function editDocument(id) {

    const doc =
        documents.find(
            document =>
                document.id === id
        );


    if (!doc) return;


    editingId = id;


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Edit Document";


    document.getElementById(
        "documentDate"
    ).value =
        doc.date;


    document.getElementById(
        "documentName"
    ).value =
        doc.documentName;


    document.getElementById(
        "trustedBy"
    ).value =
        doc.trustedBy;


    document.getElementById(
        "remark"
    ).value =
        doc.remark;



    /* ===== SIGNATORIES ===== */

    document.getElementById(
        "signatoriesContainer"
    ).innerHTML = "";


    if (
        doc.signatories &&
        doc.signatories.length > 0
    ) {

        doc.signatories.forEach(
            person => {

                addSignatoryField(
                    person.name,
                    person.dateTime,
                    person.signed
                );

            }
        );

    }

    else {

        addSignatoryField();

    }



    /* ===== RECEIVED ===== */

    document.getElementById(
        "receivedContainer"
    ).innerHTML = "";


    if (
        doc.receivedBy &&
        doc.receivedBy.length > 0
    ) {

        doc.receivedBy.forEach(
            person => {

                addReceivedField(
                    person.name,
                    person.dateTime
                );

            }
        );

    }

    else {

        addReceivedField();

    }



    document.getElementById(
        "documentModal"
    ).style.display =
        "flex";

}



/* ================= DELETE ================= */

function deleteDocument(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this document?"
        );


    if (!confirmDelete) {

        return;

    }


    documents =
        documents.filter(
            doc =>
                doc.id !== id
        );


    saveData();

    displayDocuments();

}



/* ================= DASHBOARD ================= */

function updateDashboard() {

    const total =
        documents.length;


    const completed =
        documents.filter(
            doc =>
                doc.remark ===
                "Completed"
        ).length;


    const pending =
        documents.filter(
            doc =>
                doc.remark !==
                "Completed"
        ).length;


    document.getElementById(
        "totalDocuments"
    ).textContent =
        total;


    document.getElementById(
        "completedDocuments"
    ).textContent =
        completed;


    document.getElementById(
        "pendingDocuments"
    ).textContent =
        pending;

}



/* ================= FORMAT DATE ================= */

function formatDate(date) {

    if (!date) {

        return "";

    }


    const parts =
        date.split("-");


    if (parts.length !== 3) {

        return date;

    }


    return (
        parts[1] +
        "/" +
        parts[2] +
        "/" +
        parts[0]
    );

}



/* ================= FORMAT DATE TIME ================= */

function formatDateTime(dateTime) {

    if (!dateTime) {

        return "____________";

    }


    const date =
        new Date(dateTime);


    if (isNaN(date.getTime())) {

        return dateTime;

    }


    return date.toLocaleString(
        "en-PH",
        {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}



/* ================= ESCAPE HTML ================= */

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}



/* ================= CLOSE MODAL OUTSIDE ================= */

window.addEventListener(
    "click",
    function(event) {

        const modal =
            document.getElementById(
                "documentModal"
            );


        if (
            event.target === modal
        ) {

            closeModal();

        }

    }
);



/* ================= INITIALIZE ================= */

displayDocuments();
