# SOC Management

The SOC Management widget provides an overall view of an investigation scenario in a SOC. In a single image it displays the overall picture of the investigations carried out in a SOC such as, how many alerts were created, the type of alerts, how many alerts of the total were closed, categorized as False Positive, True Positive, etc, in the time frame you have specified. It also displays information about the top three playbooks, data sources, alert types, the ROI, playbooks run, etc., and also some information about the incidents including the top three incident types, their associated assets, and analyzed artifacts.

## Version Information

**Version**: 1.0.0

**Certified**: Yes

**Publisher**: Fortinet  

**Compatibility**: 7.2.2 and later

**Applicable**: Dashboards

## SOC Management Views

**SOC Management Widget Edit View**:

<img src="https://raw.githubusercontent.com/fortinet-fortisoar/widget-soc-management/release/1.0.0/docs/media/soc_mngt_edit.png" alt="Editing the SOC Management widget" style="border: 1px solid #A9A9A9; border-radius: 4px; padding: 10px; display: block; margin-left: auto; margin-right: auto;">

**SOC Management Widget - Dashboard View**:

<img src="https://raw.githubusercontent.com/fortinet-fortisoar/widget-soc-management/release/1.0.0/docs/media/soc_mngt_dashboard.png" alt="Viewing the SOC Managment widget on the Dashboard page" style="border: 1px solid #A9A9A9; border-radius: 4px; padding: 10px; display: block; margin-left: auto; margin-right: auto;">

The following matrices are displayed by the SOC Management Widget:

- The total number of alerts present on your system that are filtered based on the field and time range you have specified. In our case, we have specified alerts that were created in the last 7 days, which comes to 1.3K alerts (in our example).  The total alerts are further classified into:
  - True Positive alerts (1.3K)
  - False Positive alerts (1)
  - Closed alerts (2)
  - Total number of incidents (13) 
- The **Top 3 Data Sources** for the alerts created in the specified time range. In our example they are, FortiSIEM, Splunk, and User Reported.
- The **Top 3 Playbooks** that were executed in the specified time range. In our example they are, Indicator (Type IP) - Get Reputation, Compute Alert Priority Weight (Post Indicator Extraction), and Create Alerts.
  You can click the names of the playbook to open the respective playbook in the Playbook Designer. 
- The **Top 3 Alert Types** of the alerts created in the specified time range. In our example they are, Denial of Service, Lost / Stolen, and Brute Force Attack.
- The **Top 3 Incident Types** of the incidents that were created in the specified time range. In our example they are, Malware, Beaconing, and Denial of Service.
- The **Impact** of the incidents in terms of savings in the dollars in the specified time range.  In our example, it is $385.   
    **Important**: To view this information, a new field named '**Impact ROI**' is added to the 'Incident' module. The 'Impact ROI' field can be added using any of the following methods:
    - Upgrade the SOAR Framework Solution pack to version 2.0.0 or later.
    - Add the **Impact ROI** as an 'Integer' type field to the Incident module in your system. For information on adding fields to a module see the 'Module Editor' topic in the 'Administration Guide' that is part of the FortiSOAR product documentation.
- The count of **Assets** associated with the incidents in the specified time range. 
- The number of **Artifacts Analyzed** that are associated with the incidents in the specified time range.    
- Apart from these matrices, the widget also includes the following matrices:
  - **Ratio Alert to Incident** displays the ratio of the total number of alerts to the number of alerts that were escalated to incidents in the specified time range.
  - **Playbook Run** displays the total number of playbooks executed in the specified time range.
  - **Actions Executed** displays the total number of playbook actions executed in the specified time range.
  - **ROI** displays the ROI of playbook actions executed in terms of savings in the dollars in the specified time range. 
  - **Alert Resolved** displays the total number of alerts resolved in the specified time range.
  - **Overall Time Saved** displays the time saved by executing playbook actions in the specified time range. 
  - **Alert MTTR** displays the mean time it took to resolve alerts in the specified time range.
  - **Incident MTTR** displays the mean time it took to resolve incidents in the specified time range.

## SOC Management Widget Settings

Provide the following details to customize the SOC Management widget to suit your requirements:

| Fields     | Description                              |
| ---------- | ---------------------------------------- |
| Title      | Specify the heading or title of the image that represents the overall view of an investigation scenario in a SOC. |
| Time Range | Specify the time range for which you want to represent the SOC investigation details on the dashboard. The field that you select to specify the time range must of type *DateTime*. For example, `Created On is in the last 7 days`. |

