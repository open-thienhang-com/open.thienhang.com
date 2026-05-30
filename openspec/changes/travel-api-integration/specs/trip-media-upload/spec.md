## ADDED Requirements

### Requirement: Upload trip photo via Uploads domain
The system SHALL allow users to upload a photo during trip creation using `POST /data-mesh/domains/uploads/imgur`.

#### Scenario: Select and upload a photo
- **WHEN** the user selects a file in the Upload Photo step
- **THEN** the system posts it to `/data-mesh/domains/uploads/imgur` and displays a preview of the returned URL

#### Scenario: Upload failure
- **WHEN** the upload request fails
- **THEN** the system displays an error toast with a retry option

#### Scenario: Provider selection (advanced)
- **WHEN** the user expands "Advanced Upload Options"
- **THEN** the system offers Imgur, Supabase, and GCS as provider options, calling the corresponding endpoint

#### Scenario: Uploaded photo attached to story
- **WHEN** the upload succeeds
- **THEN** the returned image URL is stored in the trip creation form's `thumbnail` field
