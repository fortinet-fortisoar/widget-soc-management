| [Home](../README.md) |
|--------------------------------------------|

# Installation
1. To install a widget, click **Content Hub** > **Discover**.
2. From the list of widget that appears, search for and select **SOC Management Widget**.
3. Click the **SOC Management Widget** widgetcard.
4. Click **Install** on the bottom to begin installation.

# Configuration
**SOC Management Widget Settings** 

Provide the following details to customize the SOC Management widget to suit your requirements:

| Fields     | Description                              |
| ---------- | ---------------------------------------- |
| Title      | Specify the heading or title of the image that represents the overall view of an investigation scenario in a SOC. |
| Time Range | Specify the time range for which you want to represent the SOC investigation details on the dashboard. The field that you select to specify the time range must of type *DateTime*. For example, `Created On is in the last 7 days`. |
| Tags to Exclude | Mention Playbook tags which user wants to exclude. Playbooks with given tags will not be included in the "Top 3 Playbooks" box.|
### Record Containing JSON Data

| Fields                                     | Description                                                                                                                                                                     |
|--------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Data Source                                | Select the module from which to fetch the data                                                                                                                           |
| Select Field                               | Select the field(Column) of the module which contains the `JSON` data                                                                                                           |
| Filter Record Which Contains The JSON Data | Add conditions to retrieve only the record meeting the filter conditions. If multiple records match the conditions given, the first record is considered.                       |
