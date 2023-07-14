| [Home](../README.md) |
|----------------------|

# Installation
1. To install a widget, click **Content Hub** > **Discover**.
2. From the list of widgets that appears, search for and select **SOC Management** widget.
3. Click the **SOC Management** widget card.
4. Click **Install** on the lower part of the screen to begin installation.

# Configuration

The following sections lay out information necessary to customize this widget.

## Record Containing JSON Data

| Fields                                     | Description                                                                                                                                               |
|--------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| JSON Data Source Modules                   | Select the module from which to fetch the data                                                                                                            |
| Select Field                               | Select the field(Column) of the module which contains the `JSON` data                                                                                     |
| Filter Record Which Contains The JSON Data | Add conditions to retrieve only the records meeting the filter conditions. If multiple records match the conditions given, the first record is considered.|

## Get Live Data

| Fields          | Description                                                                                                                     |
|-----------------|---------------------------------------------------------------------------------------------------------------------------------|
| Title           | Specify the heading or title of the image that represents the overall view of an investigation scenario in a SOC.               |
| Time Range      | Specify the field and the time range for which to represent the SOC investigation details on the dashboard.                     |
| Tags to Exclude | Specify the playbook tags to exclude. Playbooks with given tags do not appear in the **Top 3 Playbooks** box.                   |

## Configuring Impact ROI

To display the *Impact* of the incidents in terms of savings, add a new field **Impact ROI** using one of the following methods:

- Upgrade the SOAR Framework Solution pack to version 2.0.0 or later

    OR

1. Add Impact ROI as an `Integer` type field to the Incident module.

2. Add this field to the System View Templates (SVT) of the incident module.

    - Refer to the [Module Editor](https://docs.fortinet.com/document/fortisoar/7.4.1/administration-guide/97786/application-editor#Module_Editor) section in FortiSOAR product documentation for adding fields to a module.
    
    Refer to the [Dashboards, Templates, and Widgets](https://docs.fortinet.com/document/fortisoar/7.4.1/user-guide/207943/dashboards-templates-and-widgets#Dashboards,_Templates,_and_Widgets) section in FortiSOAR product documentation for adding a field to the SVT of the module.

| [Usage](./usage.md) |
|---------------------|